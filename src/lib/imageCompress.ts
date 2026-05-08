/** Formatos aceites no input (o output é normalizado para JPEG). */
export const ACCEPTED_IMAGE_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const DEFAULT_MAX_EDGE = 1920;
const DEFAULT_QUALITY = 0.82;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/**
 * Redimensiona (se necessário) e comprime para JPEG para reduzir peso em Firestore/PDF.
 */
export async function compressImageFile(
  file: File,
  opts?: { maxEdge?: number; quality?: number }
): Promise<{ blob: Blob; dataUrl: string; mimeOut: "image/jpeg" }> {
  const maxEdge = opts?.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = opts?.quality ?? DEFAULT_QUALITY;

  const type = (file.type || "").toLowerCase();
  if (!type.startsWith("image/")) {
    throw new Error("O ficheiro não é uma imagem.");
  }
  if (
    !ACCEPTED_IMAGE_MIME.includes(type as (typeof ACCEPTED_IMAGE_MIME)[number]) &&
    type !== "image/pjpeg"
  ) {
    throw new Error(
      "Formato não suportado. Use JPG, PNG, WebP ou GIF."
    );
  }

  const bitmap = await createImageBitmap(file);
  try {
    let { width, height } = bitmap;
    if (width > maxEdge || height > maxEdge) {
      const scale = maxEdge / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível.");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Falha ao comprimir."))),
        "image/jpeg",
        quality
      );
    });

    const dataUrl = await blobToDataUrl(blob);
    return { blob, dataUrl, mimeOut: "image/jpeg" };
  } finally {
    bitmap.close();
  }
}
