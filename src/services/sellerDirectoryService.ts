import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebaseconfig";

const COLLECTION = "sellerDirectory";

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
