import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  updateDoc,
} from "firebase/firestore/lite";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../lib/firebaseconfig";

export interface ObraDocumentoMeta {
  id?: string;
  projectId: string;
  obraName: string;
  category: string;
  description: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  downloadUrl: string;
  uploadedAt: string;
  updatedAt: string;
  uploadedBy?: string;
}

const COLLECTION = "obraDocumentos";

function cleanUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export const uploadObraDocumento = async (
  file: File,
  meta: Omit<
    ObraDocumentoMeta,
    | "id"
    | "storagePath"
    | "downloadUrl"
    | "uploadedAt"
    | "updatedAt"
    | "mimeType"
    | "sizeBytes"
    | "fileName"
  >
): Promise<string> => {
  const id = doc(collection(db, COLLECTION)).id;
  const safeName = file.name.replace(/[^\w.\-()\s]/g, "_");
  const path = `obras/${meta.projectId}/${id}_${safeName}`;
  const sRef = storageRef(storage, path);
  await uploadBytes(sRef, file, { contentType: file.type || undefined });
  const downloadUrl = await getDownloadURL(sRef);
  const now = new Date().toISOString();
  const row = cleanUndefined({
    projectId: meta.projectId,
    obraName: meta.obraName,
    category: meta.category,
    description: meta.description,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    storagePath: path,
    downloadUrl,
    uploadedAt: now,
    updatedAt: now,
    uploadedBy: meta.uploadedBy,
  });
  await setDoc(doc(db, COLLECTION, id), row);
  return id;
};

export const deleteObraDocumento = async (
  docMeta: Pick<ObraDocumentoMeta, "id" | "storagePath">
): Promise<void> => {
  if (!docMeta.id) return;
  try {
    await deleteObject(storageRef(storage, docMeta.storagePath));
  } catch {
    // arquivo pode já ter sido removido no Storage
  }
  await deleteDoc(doc(db, COLLECTION, docMeta.id));
};

export const updateObraDocumentoMeta = async (
  id: string,
  updates: Partial<
    Pick<ObraDocumentoMeta, "category" | "description" | "obraName">
  >
): Promise<void> => {
  const clean = cleanUndefined(updates as Record<string, unknown>);
  await updateDoc(doc(db, COLLECTION, id), {
    ...clean,
    updatedAt: new Date().toISOString(),
  });
};

export const listDocumentosByProject = async (
  projectId: string
): Promise<ObraDocumentoMeta[]> => {
  const q = query(
    collection(db, COLLECTION),
    where("projectId", "==", projectId)
  );
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ObraDocumentoMeta[];
  return rows.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
};
