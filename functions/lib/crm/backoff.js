"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
exports.computeBackoffMs = computeBackoffMs;
exports.parseRetryAfterMs = parseRetryAfterMs;
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function computeBackoffMs(params) {
    const baseMs = params.baseMs ?? 400;
    const maxMs = params.maxMs ?? 12_000;
    const exp = Math.min(params.attempt, 8);
    const raw = baseMs * 2 ** exp;
    const jitter = 0.7 + Math.random() * 0.6; // 0.7..1.3
    return Math.min(maxMs, Math.round(raw * jitter));
}
function parseRetryAfterMs(h) {
    if (!h)
        return null;
    const s = h.trim();
    if (!s)
        return null;
    const n = Number(s);
    if (Number.isFinite(n) && n > 0)
        return Math.round(n * 1000);
    const dt = new Date(s);
    if (!Number.isNaN(dt.getTime())) {
        const ms = dt.getTime() - Date.now();
        return ms > 0 ? ms : 0;
    }
    return null;
}
