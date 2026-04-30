import { CrmError } from "./errors";
import { env } from "./env";
import { computeBackoffMs, sleep } from "./backoff";

type OAuthTokenResponse = {
  access_token?: unknown;
  expires_in?: unknown;
  token_type?: unknown;
};

function safeStr(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function safeNum(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

/**
 * Provedor de token "renovável" via endpoint OAuth-like.
 * Variáveis esperadas (mínimo):
 * - CRM_TOKEN_URL
 * - CRM_CLIENT_ID
 * - CRM_CLIENT_SECRET
 * - CRM_REFRESH_TOKEN (opcional, depende do provedor)
 *
 * Observação: como cada CRM é diferente, este provider é "compatível" com o padrão
 * de refresh_token em x-www-form-urlencoded e com respostas access_token/expires_in.
 */
export async function fetchNewAccessToken(): Promise<{ accessToken: string; expiresAtMs: number }> {
  const url = env("CRM_TOKEN_URL");
  const clientId = env("CRM_CLIENT_ID");
  const clientSecret = env("CRM_CLIENT_SECRET");
  const refreshToken = env("CRM_REFRESH_TOKEN");

  if (!url || !clientId || !clientSecret) {
    throw new CrmError(
      "CRM token provider not configured (CRM_TOKEN_URL/CRM_CLIENT_ID/CRM_CLIENT_SECRET).",
      { retriable: false }
    );
  }

  const body = new URLSearchParams();
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);

  // Padrão mais comum
  body.set("grant_type", refreshToken ? "refresh_token" : "client_credentials");
  if (refreshToken) body.set("refresh_token", refreshToken);

  const maxAttempts = 4;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        const retriable = res.status >= 500 || res.status === 429;
        throw new CrmError(`Token endpoint: ${res.status} ${res.statusText} ${t}`.trim(), {
          status: res.status,
          retriable,
        });
      }

      const json = (await res.json()) as OAuthTokenResponse;
      const accessToken = safeStr(json.access_token);
      const expiresIn = safeNum(json.expires_in) ?? 3600;
      if (!accessToken) throw new CrmError("Token endpoint returned no access_token.", { retriable: false });

      // margem de 60s
      const expiresAtMs = Date.now() + Math.max(60, expiresIn - 60) * 1000;
      return { accessToken, expiresAtMs };
    } catch (e) {
      const ce = e instanceof CrmError ? e : new CrmError(String(e), { retriable: true });
      if (!ce.retriable || attempt === maxAttempts - 1) throw ce;
      await sleep(computeBackoffMs({ attempt, baseMs: 500, maxMs: 10_000 }));
    }
  }

  throw new CrmError("Unable to obtain CRM access token.", { retriable: true });
}

