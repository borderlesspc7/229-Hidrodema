import type { Photo } from "../types/obrasGerenciamentoModule";

/** URL para `<img src>` — prioriza Storage; fallback para data URL local/legado. */
export function getPhotoSrc(photo: Photo): string {
  if (photo.storageUrl?.startsWith("http")) return photo.storageUrl;
  if (photo.dataUrl?.startsWith("data:")) return photo.dataUrl;
  return "";
}
