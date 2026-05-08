import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";

export interface ObraMedicao {
  id?: string;
  projectId: string;
  obraName: string;
  category: string;
  value: string;
  unit: string;
  referenceDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

const COLLECTION = "obraMedicoes";

export const createObraMedicao = async (
  data: Omit<ObraMedicao, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const now = new Date().toISOString();
  const clean = Object.fromEntries(
    Object.entries({ ...data }).filter(([, v]) => v !== undefined)
  );
  const ref = await addDoc(collection(db, COLLECTION), {
    ...clean,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
};

export const updateObraMedicao = async (
  id: string,
  updates: Partial<Omit<ObraMedicao, "id">>
): Promise<void> => {
  const clean = Object.fromEntries(
    Object.entries({ ...updates }).filter(([, v]) => v !== undefined)
  );
  await updateDoc(doc(db, COLLECTION, id), {
    ...clean,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteObraMedicao = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};

export const listMedicoesByProject = async (
  projectId: string
): Promise<ObraMedicao[]> => {
  const q = query(
    collection(db, COLLECTION),
    where("projectId", "==", projectId)
  );
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ObraMedicao[];
  return rows.sort(
    (a, b) =>
      new Date(b.referenceDate).getTime() - new Date(a.referenceDate).getTime()
  );
};
