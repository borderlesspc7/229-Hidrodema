import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import { env } from "../crm/env";
import { getDb } from "../firebaseDb";
import { safeFirestoreDocId } from "./sellerMapper";

type ExternalSellerRecord = Record<string, unknown>;

type ExternalSellerDirectoryDoc = {
  externalId: string;
  name?: string;
  code?: string;
  email?: string;
  raw: ExternalSellerRecord;
  updatedAt: string;
};

function pickString(r: ExternalSellerRecord, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

function extractArray(payload: unknown): ExternalSellerRecord[] {
  if (Array.isArray(payload)) return payload as ExternalSellerRecord[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data as ExternalSellerRecord[];
    if (Array.isArray(o.sellers)) return o.sellers as ExternalSellerRecord[];
    if (Array.isArray(o.items)) return o.items as ExternalSellerRecord[];
  }
  return [];
}

function getExternalIdFromRecord(r: ExternalSellerRecord): string {
  const id =
    pickString(r, ["id", "externalId", "sellerId", "codigo", "code"]) ??
    (typeof r.id === "number" ? String(r.id) : undefined);
  if (id) return id;
  const email = pickString(r, ["email", "mail"]);
  if (email) return `email:${email}`;
  const name = pickString(r, ["name", "nome", "fullName"]);
  if (name) return `name:${name}`;
  return `hash:${JSON.stringify(r).slice(0, 120)}`;
}

function mapExternalRecordToDirectoryDoc(
  r: ExternalSellerRecord,
  nowIso: string
): ExternalSellerDirectoryDoc {
  return {
    externalId: getExternalIdFromRecord(r),
    name: pickString(r, ["name", "nome", "fullName", "razaoSocial"]),
    code: pickString(r, ["code", "codigo", "sellerCode", "matricula"]),
    email: pickString(r, ["email", "mail"]),
    raw: r,
    updatedAt: nowIso,
  };
}

async function fetchExternalSellers(): Promise<ExternalSellerRecord[]> {
  const base = env("SELLER_API_BASE_URL")?.replace(/\/$/, "");
  if (!base) {
    throw new Error("SELLER_API_BASE_URL não configurado nas variáveis do Functions.");
  }

  const token = env("SELLER_API_TOKEN");
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${base}/sellers`, { method: "GET", headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Seller API: ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`
    );
  }

  const json = (await res.json()) as unknown;
  return extractArray(json);
}

export async function syncSellerDirectoryFromExternalApi(): Promise<{
  ok: boolean;
  fetched: number;
  processed: number;
  updatedAt: string;
}> {
  const nowIso = new Date().toISOString();
  const rows = await fetchExternalSellers();
  logger.info("External sellers fetched.", { fetched: rows.length });

  const db = getDb();
  const COLLECTION = "sellerDirectory";

  // batch do Firestore suporta 500 ops; usamos 450 como margem
  const BATCH_MAX = 450;
  let processed = 0;

  for (let i = 0; i < rows.length; i += BATCH_MAX) {
    const chunk = rows.slice(i, i + BATCH_MAX);
    const batch = db.batch();
    for (const r of chunk) {
      const doc = mapExternalRecordToDirectoryDoc(r, nowIso);
      const docId = safeFirestoreDocId(doc.externalId);
      batch.set(db.collection(COLLECTION).doc(docId), doc, { merge: true });
      processed++;
    }
    await batch.commit();
  }

  return { ok: true, fetched: rows.length, processed, updatedAt: nowIso };
}
