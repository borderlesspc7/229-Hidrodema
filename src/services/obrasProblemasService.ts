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

export type ProblemaPrioridade = "alta" | "media" | "baixa";
export type ProblemaStatus =
  | "aberto"
  | "em-andamento"
  | "aguardando"
  | "resolvido";

export interface ObraProblema {
  id?: string;
  projectId: string;
  obraName: string;
  title: string;
  description: string;
  category: string;
  priority: ProblemaPrioridade;
  status: ProblemaStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

const COLLECTION = "obraProblemas";

export const createObraProblema = async (
  data: Omit<ObraProblema, "id" | "createdAt" | "updatedAt">
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

export const updateObraProblema = async (
  id: string,
  updates: Partial<Omit<ObraProblema, "id">>
): Promise<void> => {
  const clean = Object.fromEntries(
    Object.entries({ ...updates }).filter(([, v]) => v !== undefined)
  );
  await updateDoc(doc(db, COLLECTION, id), {
    ...clean,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteObraProblema = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};

export const listProblemasByProject = async (
  projectId: string
): Promise<ObraProblema[]> => {
  const q = query(
    collection(db, COLLECTION),
    where("projectId", "==", projectId)
  );
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ObraProblema[];
  const priorityOrder: Record<ProblemaPrioridade, number> = {
    alta: 0,
    media: 1,
    baixa: 2,
  };
  return rows.sort((a, b) => {
    const p = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (p !== 0) return p;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};
