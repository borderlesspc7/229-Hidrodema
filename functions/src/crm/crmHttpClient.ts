import { logger } from "firebase-functions";
import { computeBackoffMs, parseRetryAfterMs, sleep } from "./backoff";
import { circuitIsOpen, circuitRecordFailure, circuitRecordSuccess, circuitSnapshot } from "./circuitBreaker";
import { CrmError } from "./errors";
import { env } from "./env";
import { fetchNewAccessToken } from "./tokenProvider";
import { getStaticBearerToken, getStoredToken, setStoredToken, tokenIsFresh } from "./tokenStore";

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

function safeJsonString(v: unknown, max = 220): string {
  try {
    const s = typeof v === "string" ? v : JSON.stringify(v);
    return s.length > max ? `${s.slice(0, max)}…` : s;
  } catch {
    return String(v);
  }
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function headerLowerMap(h: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  h.forEach((v, k) => (out[k.toLowerCase()] = v));
  return out;
}

async function getBearerToken(): Promise<string> {
  const staticToken = getStaticBearerToken();
  if (staticToken) return staticToken;

  const stored = await getStoredToken();
  if (stored && tokenIsFresh(stored)) return stored.accessToken;

  const fresh = await fetchNewAccessToken();
  await setStoredToken({ accessToken: fresh.accessToken, expiresAtMs: fresh.expiresAtMs });
  return fresh.accessToken;
}

export type CrmRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  body?: Json;
  timeoutMs?: number;
  maxAttempts?: number;
};

export async function crmRequest<T = unknown>(opts: CrmRequestOptions): Promise<{
  status: number;
  headers: Record<string, string>;
  data: T;
}> {
  const baseUrl = env("CRM_BASE_URL");
  if (!baseUrl) throw new CrmError("CRM_BASE_URL is not configured.", { retriable: false });

  if (circuitIsOpen()) {
    const snap = circuitSnapshot();
    throw new CrmError(`CRM circuit breaker open (failures=${snap.consecutiveFailures}).`, {
      retriable: true,
    });
  }

  const method = opts.method ?? "GET";
  const url = new URL(`${normalizeBaseUrl(baseUrl)}${opts.path.startsWith("/") ? "" : "/"}${opts.path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const maxAttempts = opts.maxAttempts ?? 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const token = await getBearerToken();
    const ctrl = new AbortController();
    const timeoutMs = opts.timeoutMs ?? 25_000;
    const t = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const res = await fetch(url.toString(), {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "hidrodema-functions/1.0",
          ...(opts.body ? { "Content-Type": "application/json" } : {}),
          ...(env("CRM_RATE_LIMIT_STRATEGY") ? { "X-Client-RateLimit": env("CRM_RATE_LIMIT_STRATEGY")! } : {}),
          ...(opts.headers ?? {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: ctrl.signal,
      });

      const headers = headerLowerMap(res.headers);

      // rate-limit: respeita 429 / retry-after
      if (res.status === 429) {
        const retryAfterMs = parseRetryAfterMs(headers["retry-after"] ?? null) ?? computeBackoffMs({ attempt });
        logger.warn("CRM rate limited (429). Retrying.", {
          url: url.toString(),
          attempt,
          retryAfterMs,
        });
        await sleep(retryAfterMs);
        continue;
      }

      const text = await res.text().catch(() => "");
      const contentType = headers["content-type"] ?? "";
      const parsed: unknown =
        contentType.includes("application/json") && text
          ? (JSON.parse(text) as unknown)
          : (text as unknown);

      if (!res.ok) {
        const retriable = res.status >= 500;
        if (retriable) circuitRecordFailure();
        else circuitRecordSuccess(); // falha 4xx não "derruba" o circuito

        const msg = `CRM request failed: ${res.status} ${res.statusText} — ${safeJsonString(parsed)}`;
        if (!retriable || attempt === maxAttempts - 1) {
          throw new CrmError(msg, { status: res.status, retriable });
        }

        await sleep(computeBackoffMs({ attempt }));
        continue;
      }

      // Se o servidor sinaliza rate-limit baixo, espera um pouco antes de seguir
      const remaining = Number(headers["x-ratelimit-remaining"] ?? NaN);
      if (Number.isFinite(remaining) && remaining <= 1) {
        await sleep(900 + Math.round(Math.random() * 400));
      }

      circuitRecordSuccess();
      return { status: res.status, headers, data: parsed as T };
    } catch (e) {
      const isAbort = e instanceof Error && e.name === "AbortError";
      const ce = e instanceof CrmError ? e : new CrmError(isAbort ? "CRM request timeout." : String(e), { retriable: true });
      circuitRecordFailure();

      if (!ce.retriable || attempt === maxAttempts - 1) throw ce;
      await sleep(computeBackoffMs({ attempt }));
    } finally {
      clearTimeout(t);
    }
  }

  throw new CrmError("CRM request failed after retries.", { retriable: true });
}
