import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { DynamicFormTemplate } from "../types/dynamicForms";

const COLLECTION = "dynamicFormTemplates";

function cleanUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export async function listDynamicFormTemplates(params?: {
  key?: string;
  status?: DynamicFormTemplate["status"];
}): Promise<DynamicFormTemplate[]> {
  const base = collection(db, COLLECTION);
  const clauses = [];
  if (params?.key) clauses.push(where("key", "==", params.key));
  if (params?.status) clauses.push(where("status", "==", params.status));
  const q = clauses.length ? query(base, ...clauses) : query(base);
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as DynamicFormTemplate[];
  return rows.sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
}

export async function upsertDynamicFormTemplate(tpl: Omit<DynamicFormTemplate, "createdAt" | "updatedAt"> & {
  createdAt?: string;
  updatedAt?: string;
}): Promise<string> {
  const id = tpl.id ?? doc(collection(db, COLLECTION)).id;
  const now = new Date().toISOString();
  const row = cleanUndefined({
    ...tpl,
    createdAt: tpl.createdAt ?? now,
    updatedAt: now,
  });
  await setDoc(doc(db, COLLECTION, id), row, { merge: true });
  return id;
}

export async function archiveDynamicFormTemplate(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { status: "archived", updatedAt: new Date().toISOString() });
}

