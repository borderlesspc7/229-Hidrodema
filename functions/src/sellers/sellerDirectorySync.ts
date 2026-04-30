import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import { fetchAllCrmSellers, fetchCrmSellerById } from "./crmSellerApi";
import { mapCrmSellerToDirectoryDoc, safeFirestoreDocId } from "./sellerMapper";
import type { CrmSellerRecord, SellerDirectoryDoc } from "./sellerTypes";

const COLLECTION = "sellerDirectory";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function upsertSellerDirectoryRows(rows: CrmSellerRecord[]): Promise<{
  processed: number;
  updatedAt: string;
}> {
  const nowIso = new Date().toISOString();
  const db = admin.firestore();

  // batch do Firestore (v2 admin) suporta 500 ops; usamos 450 como margem
  const BATCH_MAX = 450;
  const batches = chunk(rows, BATCH_MAX);

  let processed = 0;
  for (const b of batches) {
    const batch = db.batch();
    for (const r of b) {
      const doc: SellerDirectoryDoc = mapCrmSellerToDirectoryDoc(r, nowIso);
      const docId = safeFirestoreDocId(doc.externalId);
      const ref = db.collection(COLLECTION).doc(docId);
      batch.set(ref, doc, { merge: true });
      processed++;
    }
    await batch.commit();
  }

  return { processed, updatedAt: nowIso };
}

export async function syncSellerDirectoryFromCrm(): Promise<{
  ok: boolean;
  fetched: number;
  processed: number;
  updatedAt: string;
}> {
  const rows = await fetchAllCrmSellers();
  logger.info("CRM sellers fetched.", { fetched: rows.length });
  const res = await upsertSellerDirectoryRows(rows);
  return { ok: true, fetched: rows.length, processed: res.processed, updatedAt: res.updatedAt };
}

export async function syncSingleSellerFromCrm(params: { sellerId: string }): Promise<{
  ok: boolean;
  sellerId: string;
  processed: number;
  updatedAt: string;
}> {
  const row = await fetchCrmSellerById(params.sellerId);
  if (!row) return { ok: true, sellerId: params.sellerId, processed: 0, updatedAt: new Date().toISOString() };
  const res = await upsertSellerDirectoryRows([row]);
  return { ok: true, sellerId: params.sellerId, processed: 1, updatedAt: res.updatedAt };
}

