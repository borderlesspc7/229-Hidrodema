"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNewAccessToken = fetchNewAccessToken;
const errors_1 = require("./errors");
const env_1 = require("./env");
const backoff_1 = require("./backoff");
function safeStr(v) {
    return typeof v === "string" && v.trim() ? v.trim() : null;
}
function safeNum(v) {
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
async function fetchNewAccessToken() {
    const url = (0, env_1.env)("CRM_TOKEN_URL");
    const clientId = (0, env_1.env)("CRM_CLIENT_ID");
    const clientSecret = (0, env_1.env)("CRM_CLIENT_SECRET");
    const refreshToken = (0, env_1.env)("CRM_REFRESH_TOKEN");
    if (!url || !clientId || !clientSecret) {
        throw new errors_1.CrmError("CRM token provider not configured (CRM_TOKEN_URL/CRM_CLIENT_ID/CRM_CLIENT_SECRET).", { retriable: false });
    }
    const body = new URLSearchParams();
    body.set("client_id", clientId);
    body.set("client_secret", clientSecret);
    // Padrão mais comum
    body.set("grant_type", refreshToken ? "refresh_token" : "client_credentials");
    if (refreshToken)
        body.set("refresh_token", refreshToken);
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
                throw new errors_1.CrmError(`Token endpoint: ${res.status} ${res.statusText} ${t}`.trim(), {
                    status: res.status,
                    retriable,
                });
            }
            const json = (await res.json());
            const accessToken = safeStr(json.access_token);
            const expiresIn = safeNum(json.expires_in) ?? 3600;
            if (!accessToken)
                throw new errors_1.CrmError("Token endpoint returned no access_token.", { retriable: false });
            // margem de 60s
            const expiresAtMs = Date.now() + Math.max(60, expiresIn - 60) * 1000;
            return { accessToken, expiresAtMs };
        }
        catch (e) {
            const ce = e instanceof errors_1.CrmError ? e : new errors_1.CrmError(String(e), { retriable: true });
            if (!ce.retriable || attempt === maxAttempts - 1)
                throw ce;
            await (0, backoff_1.sleep)((0, backoff_1.computeBackoffMs)({ attempt, baseMs: 500, maxMs: 10_000 }));
        }
    }
    throw new errors_1.CrmError("Unable to obtain CRM access token.", { retriable: true });
}
