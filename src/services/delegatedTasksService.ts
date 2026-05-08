import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";

export type DelegatedTaskStatus = "queued" | "in-progress" | "done" | "cancelled";

export type DelegatedTask = {
  id?: string;
  title: string;
  description?: string;
  status: DelegatedTaskStatus;
  assigneeUid: string;
  assigneeEmail?: string;
  createdByUid: string;
  createdByEmail?: string;
  createdAt: string;
  updatedAt: string;
};

const COLLECTION = "delegatedTasks";

export async function createDelegatedTask(input: Omit<DelegatedTask, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function listDelegatedTasksForAssignee(uid: string): Promise<DelegatedTask[]> {
  const q = query(collection(db, COLLECTION), where("assigneeUid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as DelegatedTask[];
}

export async function updateDelegatedTask(id: string, patch: Partial<Pick<DelegatedTask, "status" | "description" | "title">>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...patch, updatedAt: new Date().toISOString() });
}

