import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../lib/firebaseconfig";
import { fetchWithTimeout } from "../lib/networkResilience";
import type { Photo } from "../types/obrasGerenciamentoModule";

function diaryPhotoPath(
  projectId: string,
  entryId: string,
  photoId: string
): string {
  const safe = (s: string) => s.replace(/[^\w-]/g, "_");
  return `obras/diaries/${safe(projectId)}/${safe(entryId)}/${safe(photoId)}.jpg`;
}

export async function uploadDiaryPhoto(
  blob: Blob,
  params: { projectId: string; entryId: string; photoId: string }
): Promise<{ storagePath: string; storageUrl: string }> {
  const path = diaryPhotoPath(
    params.projectId,
    params.entryId,
    params.photoId
  );
  const ref = storageRef(storage, path);
  await uploadBytes(ref, blob, { contentType: "image/jpeg" });
  const storageUrl = await getDownloadURL(ref);
  return { storagePath: path, storageUrl };
}

export async function deleteDiaryPhotoAtPath(storagePath: string): Promise<void> {
  if (!storagePath.startsWith("obras/diaries/")) return;
  try {
    await deleteObject(storageRef(storage, storagePath));
  } catch {
    // já removido ou sem permissão
  }
}

/**
 * Envia ao Storage as fotos que ainda só têm pré-visualização local.
 * Remove `dataUrl` do objeto persistido para não estourar limites do Firestore.
 */
export async function finalizeDiaryPhotosForFirestore(
  photos: Photo[],
  entryId: string,
  projectId: string
): Promise<Photo[]> {
  const out: Photo[] = [];
  for (const p of photos) {
    if (p.storageUrl && p.storagePath) {
      out.push({
        ...p,
        dataUrl: undefined,
      });
      continue;
    }
    if (!p.dataUrl?.startsWith("data:")) {
      out.push(p);
      continue;
    }
    const res = await fetchWithTimeout(p.dataUrl, { timeoutMs: 60_000 });
    const blob = await res.blob();
    const { storagePath, storageUrl } = await uploadDiaryPhoto(blob, {
      projectId,
      entryId,
      photoId: p.id,
    });
    out.push({
      ...p,
      storageUrl,
      storagePath,
      dataUrl: undefined,
      name: p.name.replace(/\.[^.]+$/, "") + ".jpg",
    });
  }
  return out;
}
