import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import {
  mapApiRecordToDirectoryFields,
  type SellerApiRecord,
} from "./sellerApiService";

const COLLECTION = "sellerDirectory";

/** IDs de documento Firestore não podem conter `/`. */
function safeFirestoreDocId(externalId: string): string {
  return externalId.replace(/\//g, "__").slice(0, 1400);
}

export interface SellerDirectoryDoc {
  externalId: string;
  name?: string;
  code?: string;
  email?: string;
  raw?: Record<string, unknown>;
  updatedAt: string;
}

export async function listSellerDirectory(): Promise<
  (SellerDirectoryDoc & { id: string })[]
> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as SellerDirectoryDoc),
  }));
}

const BATCH_MAX = 400;

/** Persiste/atualiza lote (ID externo = id do documento). */
export async function upsertSellerDirectoryFromApi(
  rows: SellerApiRecord[]
): Promise<number> {
  const now = new Date().toISOString();
  let batch = writeBatch(db);
  let n = 0;
  let inBatch = 0;
  for (const r of rows) {
    const m = mapApiRecordToDirectoryFields(r);
    const ref = doc(db, COLLECTION, safeFirestoreDocId(m.externalId));
    batch.set(
      ref,
      {
        externalId: m.externalId,
        name: m.name,
        code: m.code,
        email: m.email,
        raw: m.raw,
        updatedAt: now,
      },
      { merge: true }
    );
    n++;
    inBatch++;
    if (inBatch >= BATCH_MAX) {
      await batch.commit();
      batch = writeBatch(db);
      inBatch = 0;
    }
  }
  if (inBatch > 0) await batch.commit();
  return n;
}
