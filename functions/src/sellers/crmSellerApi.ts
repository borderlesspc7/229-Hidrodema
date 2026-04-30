import { logger } from "firebase-functions";
import { crmRequest } from "../crm/crmHttpClient";
import { env } from "../crm/env";
import type { CrmSellerRecord } from "./sellerTypes";

function extractArray(payload: unknown): CrmSellerRecord[] {
  if (Array.isArray(payload)) return payload as CrmSellerRecord[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data as CrmSellerRecord[];
    if (Array.isArray(o.items)) return o.items as CrmSellerRecord[];
    if (Array.isArray(o.sellers)) return o.sellers as CrmSellerRecord[];
    if (Array.isArray(o.records)) return o.records as CrmSellerRecord[];
    if (Array.isArray(o.result)) return o.result as CrmSellerRecord[];
  }
  return [];
}

function readTotalPages(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as any;
  const v = o.totalPages ?? o.total_pages ?? o.pages;
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readHasMore(payload: unknown): boolean | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as any;
  const v = o.hasMore ?? o.has_more ?? o.more;
  return typeof v === "boolean" ? v : null;
}

/**
 * Busca vendedores no CRM via `/crm/v2/Seller`.
 * Implementação tolerante a contratos (data/items/sellers) e paginação (page/limit).
 */
export async function fetchAllCrmSellers(): Promise<CrmSellerRecord[]> {
  const pageSize = Number(env("CRM_SELLER_PAGE_SIZE") ?? "200");
  const maxPages = Number(env("CRM_SELLER_MAX_PAGES") ?? "50");
  const path = env("CRM_SELLER_PATH") ?? "/crm/v2/Seller";

  const out: CrmSellerRecord[] = [];
  let page = 1;
  let totalPagesHint: number | null = null;
  let emptyStreak = 0;

  while (page <= maxPages) {
    const { data } = await crmRequest<any>({
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
      if (emptyStreak >= 2) break; // evita loop infinito em APIs que ignoram paginação
    } else {
      emptyStreak = 0;
      out.push(...rows);
    }

    if (totalPagesHint == null) totalPagesHint = readTotalPages(data);
    if (totalPagesHint != null && page >= totalPagesHint) break;

    const hasMore = readHasMore(data);
    if (hasMore === false) break;

    logger.info("CRM sellers page fetched.", { page, pageSize, received: rows.length });
    page++;
  }

  return out;
}

export async function fetchCrmSellerById(id: string): Promise<CrmSellerRecord | null> {
  const pathBase = env("CRM_SELLER_PATH") ?? "/crm/v2/Seller";
  const path = `${pathBase.replace(/\/$/, "")}/${encodeURIComponent(id)}`;
  const { data } = await crmRequest<any>({
    method: "GET",
    path,
    timeoutMs: 25_000,
    maxAttempts: 5,
  });
  if (!data) return null;
  if (Array.isArray(data)) return (data[0] as any) ?? null;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (o.data && typeof o.data === "object") return o.data as CrmSellerRecord;
  }
  return data as CrmSellerRecord;
}

