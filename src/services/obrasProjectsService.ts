import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import { sortByCreatedAtDesc } from "../lib/firestoreSort";

export interface ObraProject {
  id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "planejamento" | "em-andamento" | "concluida" | "pausada";
  budget: number;
  spent: number;
  progress: number;
  milestones: unknown[];
  team: string[];
  labor?: string;
  client: string;
  createdAt: string;
  updatedAt: string;
}

const COLLECTION = "obrasProjects";

function cleanUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function listObraProjects(): Promise<ObraProject[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  const rows = snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as object) })
  ) as ObraProject[];
  return sortByCreatedAtDesc(rows);
}

export async function upsertObraProject(
  project: Omit<ObraProject, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  }
): Promise<string> {
  const id = project.id ?? Date.now().toString();
  const now = new Date().toISOString();
  const row = cleanUndefined({
    ...project,
    createdAt: project.createdAt ?? now,
    updatedAt: now,
  });
  await setDoc(doc(db, COLLECTION, id), row, { merge: true });
  return id;
}

export async function updateObraProject(
  id: string,
  updates: Partial<Omit<ObraProject, "id" | "createdAt">>
): Promise<void> {
  const clean = cleanUndefined(updates as Record<string, unknown>);
  await updateDoc(doc(db, COLLECTION, id), {
    ...clean,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteObraProject(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

