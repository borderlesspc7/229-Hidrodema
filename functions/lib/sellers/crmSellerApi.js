"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllCrmSellers = fetchAllCrmSellers;
exports.fetchCrmSellerById = fetchCrmSellerById;
const firebase_functions_1 = require("firebase-functions");
const crmHttpClient_1 = require("../crm/crmHttpClient");
const env_1 = require("../crm/env");
function extractArray(payload) {
    if (Array.isArray(payload))
        return payload;
    if (payload && typeof payload === "object") {
        const o = payload;
        if (Array.isArray(o.data))
            return o.data;
        if (Array.isArray(o.items))
            return o.items;
        if (Array.isArray(o.sellers))
            return o.sellers;
        if (Array.isArray(o.records))
            return o.records;
        if (Array.isArray(o.result))
            return o.result;
    }
    return [];
}
function readTotalPages(payload) {
    if (!payload || typeof payload !== "object")
        return null;
    const o = payload;
    const v = o.totalPages ?? o.total_pages ?? o.pages;
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
}
function readHasMore(payload) {
    if (!payload || typeof payload !== "object")
        return null;
    const o = payload;
    const v = o.hasMore ?? o.has_more ?? o.more;
    return typeof v === "boolean" ? v : null;
}
/**
 * Busca vendedores no CRM via `/crm/v2/Seller`.
 * Implementação tolerante a contratos (data/items/sellers) e paginação (page/limit).
 */
async function fetchAllCrmSellers() {
    const pageSize = Number((0, env_1.env)("CRM_SELLER_PAGE_SIZE") ?? "200");
    const maxPages = Number((0, env_1.env)("CRM_SELLER_MAX_PAGES") ?? "50");
    const path = (0, env_1.env)("CRM_SELLER_PATH") ?? "/crm/v2/Seller";
    const out = [];
    let page = 1;
    let totalPagesHint = null;
    let emptyStreak = 0;
    while (page <= maxPages) {
        const { data } = await (0, crmHttpClient_1.crmRequest)({
            method: "GET",
            path,
            query: {
                page,
                pageSize,
                limit: pageSize,
                per_page: pageSize,
            },
            timeoutMs: 35_000,
        });
        const rows = extractArray(data);
        if (rows.length === 0) {
            emptyStreak++;
            if (emptyStreak >= 2)
                break; // evita loop infinito em APIs que ignoram paginação
        }
        else {
            emptyStreak = 0;
            out.push(...rows);
        }
        if (totalPagesHint == null)
            totalPagesHint = readTotalPages(data);
        if (totalPagesHint != null && page >= totalPagesHint)
            break;
        const hasMore = readHasMore(data);
        if (hasMore === false)
            break;
        firebase_functions_1.logger.info("CRM sellers page fetched.", { page, pageSize, received: rows.length });
        page++;
    }
    return out;
}
async function fetchCrmSellerById(id) {
    const pathBase = (0, env_1.env)("CRM_SELLER_PATH") ?? "/crm/v2/Seller";
    const path = `${pathBase.replace(/\/$/, "")}/${encodeURIComponent(id)}`;
    const { data } = await (0, crmHttpClient_1.crmRequest)({
        method: "GET",
        path,
        timeoutMs: 25_000,
        maxAttempts: 5,
    });
    if (!data)
        return null;
    if (Array.isArray(data))
        return data[0] ?? null;
    if (data && typeof data === "object") {
        const o = data;
        if (o.data && typeof o.data === "object")
            return o.data;
    }
    return data;
}
