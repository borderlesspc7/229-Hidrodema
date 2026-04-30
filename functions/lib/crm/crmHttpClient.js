"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crmRequest = crmRequest;
const firebase_functions_1 = require("firebase-functions");
const backoff_1 = require("./backoff");
const circuitBreaker_1 = require("./circuitBreaker");
const errors_1 = require("./errors");
const env_1 = require("./env");
const tokenProvider_1 = require("./tokenProvider");
const tokenStore_1 = require("./tokenStore");
function safeJsonString(v, max = 220) {
    try {
        const s = typeof v === "string" ? v : JSON.stringify(v);
        return s.length > max ? `${s.slice(0, max)}…` : s;
    }
    catch {
        return String(v);
    }
}
function normalizeBaseUrl(url) {
    return url.replace(/\/$/, "");
}
function headerLowerMap(h) {
    const out = {};
    h.forEach((v, k) => (out[k.toLowerCase()] = v));
    return out;
}
async function getBearerToken() {
    const staticToken = (0, tokenStore_1.getStaticBearerToken)();
    if (staticToken)
        return staticToken;
    const stored = await (0, tokenStore_1.getStoredToken)();
    if (stored && (0, tokenStore_1.tokenIsFresh)(stored))
        return stored.accessToken;
    const fresh = await (0, tokenProvider_1.fetchNewAccessToken)();
    await (0, tokenStore_1.setStoredToken)({ accessToken: fresh.accessToken, expiresAtMs: fresh.expiresAtMs });
    return fresh.accessToken;
}
async function crmRequest(opts) {
    const baseUrl = (0, env_1.env)("CRM_BASE_URL");
    if (!baseUrl)
        throw new errors_1.CrmError("CRM_BASE_URL is not configured.", { retriable: false });
    if ((0, circuitBreaker_1.circuitIsOpen)()) {
        const snap = (0, circuitBreaker_1.circuitSnapshot)();
        throw new errors_1.CrmError(`CRM circuit breaker open (failures=${snap.consecutiveFailures}).`, {
            retriable: true,
        });
    }
    const method = opts.method ?? "GET";
    const url = new URL(`${normalizeBaseUrl(baseUrl)}${opts.path.startsWith("/") ? "" : "/"}${opts.path}`);
    if (opts.query) {
        for (const [k, v] of Object.entries(opts.query)) {
            if (v === undefined || v === null)
                continue;
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
                    ...((0, env_1.env)("CRM_RATE_LIMIT_STRATEGY") ? { "X-Client-RateLimit": (0, env_1.env)("CRM_RATE_LIMIT_STRATEGY") } : {}),
                    ...(opts.headers ?? {}),
                },
                body: opts.body ? JSON.stringify(opts.body) : undefined,
                signal: ctrl.signal,
            });
            const headers = headerLowerMap(res.headers);
            // rate-limit: respeita 429 / retry-after
            if (res.status === 429) {
                const retryAfterMs = (0, backoff_1.parseRetryAfterMs)(headers["retry-after"] ?? null) ?? (0, backoff_1.computeBackoffMs)({ attempt });
                firebase_functions_1.logger.warn("CRM rate limited (429). Retrying.", {
                    url: url.toString(),
                    attempt,
                    retryAfterMs,
                });
                await (0, backoff_1.sleep)(retryAfterMs);
                continue;
            }
            const text = await res.text().catch(() => "");
            const contentType = headers["content-type"] ?? "";
            const parsed = contentType.includes("application/json") && text
                ? JSON.parse(text)
                : text;
            if (!res.ok) {
                const retriable = res.status >= 500;
                if (retriable)
                    (0, circuitBreaker_1.circuitRecordFailure)();
                else
                    (0, circuitBreaker_1.circuitRecordSuccess)(); // falha 4xx não "derruba" o circuito
                const msg = `CRM request failed: ${res.status} ${res.statusText} — ${safeJsonString(parsed)}`;
                if (!retriable || attempt === maxAttempts - 1) {
                    throw new errors_1.CrmError(msg, { status: res.status, retriable });
                }
                await (0, backoff_1.sleep)((0, backoff_1.computeBackoffMs)({ attempt }));
                continue;
            }
            // Se o servidor sinaliza rate-limit baixo, espera um pouco antes de seguir
            const remaining = Number(headers["x-ratelimit-remaining"] ?? NaN);
            if (Number.isFinite(remaining) && remaining <= 1) {
                await (0, backoff_1.sleep)(900 + Math.round(Math.random() * 400));
            }
            (0, circuitBreaker_1.circuitRecordSuccess)();
            return { status: res.status, headers, data: parsed };
        }
        catch (e) {
            const isAbort = e instanceof Error && e.name === "AbortError";
            const ce = e instanceof errors_1.CrmError ? e : new errors_1.CrmError(isAbort ? "CRM request timeout." : String(e), { retriable: true });
            (0, circuitBreaker_1.circuitRecordFailure)();
            if (!ce.retriable || attempt === maxAttempts - 1)
                throw ce;
            await (0, backoff_1.sleep)((0, backoff_1.computeBackoffMs)({ attempt }));
        }
        finally {
            clearTimeout(t);
        }
    }
    throw new errors_1.CrmError("CRM request failed after retries.", { retriable: true });
}
