import { fetchWithTimeout } from "../lib/networkResilience";

/** Formato flexível da API externa (ajuste o mapeamento ao contrato real). */
export type SellerApiRecord = Record<string, unknown>;

function pickString(r: SellerApiRecord, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function extractArray(payload: unknown): SellerApiRecord[] {
  if (Array.isArray(payload)) return payload as SellerApiRecord[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data as SellerApiRecord[];
    if (Array.isArray(o.sellers)) return o.sellers as SellerApiRecord[];
    if (Array.isArray(o.items)) return o.items as SellerApiRecord[];
  }
  return [];
}

/**
 * GET na API de vendedores. Configure `VITE_SELLER_API_BASE_URL` (ex.: https://api.exemplo.com/v1).
 * Opcional: `VITE_SELLER_API_TOKEN` como Bearer.
 */
export async function fetchExternalSellers(): Promise<SellerApiRecord[]> {
  const base = import.meta.env.VITE_SELLER_API_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error(
      "Defina VITE_SELLER_API_BASE_URL no .env para sincronizar vendedores."
    );
  }

  const token = import.meta.env.VITE_SELLER_API_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetchWithTimeout(`${base}/sellers`, {
    method: "GET",
    headers,
    timeoutMs: 30_000,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `API Seller: ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`
    );
  }

  const json = (await res.json()) as unknown;
  return extractArray(json);
}

export function getExternalIdFromRecord(r: SellerApiRecord): string {
  const id =
    pickString(r, ["id", "externalId", "sellerId", "codigo", "code"]) ??
    (typeof r.id === "number" ? String(r.id) : undefined);
  if (id) return id;
  const name = pickString(r, ["name", "nome", "fullName"]);
  if (name) return `name:${name}`;
  return `hash:${JSON.stringify(r).slice(0, 80)}`;
}

export function mapApiRecordToDirectoryFields(r: SellerApiRecord): {
  externalId: string;
  name?: string;
  code?: string;
  email?: string;
  raw: Record<string, unknown>;
} {
  const externalId = getExternalIdFromRecord(r);
  return {
    externalId,
    name: pickString(r, ["name", "nome", "fullName", "razaoSocial"]),
    code: pickString(r, ["code", "codigo", "sellerCode", "matricula"]),
    email: pickString(r, ["email", "mail"]),
    raw: r,
  };
}
