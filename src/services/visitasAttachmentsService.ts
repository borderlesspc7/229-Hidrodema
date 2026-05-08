import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../lib/firebaseconfig";

export type VisitPhoto = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  storageUrl: string;
  storagePath: string;
};

function visitPhotoPath(requestId: string, photoId: string, fileName: string): string {
  const safe = (s: string) => s.replace(/[^\w.\-()\s]/g, "_");
  return `visits/${safe(requestId)}/photos/${safe(photoId)}_${safe(fileName)}`;
}

export async function uploadVisitPhoto(params: {
  requestId: string;
  fileName: string;
  blob: Blob;
  mimeType: string;
}): Promise<VisitPhoto> {
  const id = `${Date.now()}`;
  const path = visitPhotoPath(params.requestId, id, params.fileName);
  const ref = storageRef(storage, path);
  await uploadBytes(ref, params.blob, { contentType: params.mimeType || undefined });
  const storageUrl = await getDownloadURL(ref);
  const uploadedAt = new Date().toISOString();
  return {
    id,
    name: params.fileName,
    mimeType: params.mimeType || "application/octet-stream",
    sizeBytes: params.blob.size,
    uploadedAt,
    storageUrl,
    storagePath: path,
  };
}

export async function deleteVisitPhoto(photo: Pick<VisitPhoto, "storagePath">): Promise<void> {
  try {
    await deleteObject(storageRef(storage, photo.storagePath));
  } catch {
    // já removido ou sem permissão
  }
}

