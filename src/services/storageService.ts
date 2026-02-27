import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebaseconfig";

/**
 * Faz upload de um arquivo para Storage no path obras/{projectId}/{entryId}/{fileName}.
 * Retorna a URL de download.
 */
export async function uploadObraAttachment(
  projectId: string,
  entryId: string,
  file: File
): Promise<string> {
  const path = `obras/${projectId}/${entryId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/**
 * Faz upload de um documento da obra para Storage no path obras/documents/{projectId}/{fileName}.
 */
export async function uploadObraDocument(
  projectId: string,
  file: File
): Promise<string> {
  const path = `obras/documents/${projectId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
