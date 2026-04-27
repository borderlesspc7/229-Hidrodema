import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../lib/firebaseconfig";
import { fetchWithTimeout } from "../lib/networkResilience";
import type { Photo } from "../types/obrasGerenciamentoModule";

function signaturePath(projectId: string, reportId: string): string {
  const safe = (s: string) => s.replace(/[^\w-]/g, "_");
  return `obras/reports/${safe(projectId)}/${safe(reportId)}/signature.png`;
}

export async function uploadReportSignature(params: {
  projectId: string;
  reportId: string;
  dataUrl: string;
}): Promise<{ storagePath: string; storageUrl: string }> {
  const res = await fetchWithTimeout(params.dataUrl, { timeoutMs: 60_000 });
  const blob = await res.blob();
  const path = signaturePath(params.projectId, params.reportId);
  const ref = storageRef(storage, path);
  await uploadBytes(ref, blob, { contentType: "image/png" });
  const storageUrl = await getDownloadURL(ref);
  return { storagePath: path, storageUrl };
}

export async function deleteReportSignatureAtPath(storagePath: string): Promise<void> {
  if (!storagePath.startsWith("obras/reports/")) return;
  try {
    await deleteObject(storageRef(storage, storagePath));
  } catch {
    // já removido ou sem permissão
  }
}

export async function finalizeSignatureForFirestore(params: {
  signature: Photo | undefined;
  projectId: string;
  reportId: string;
}): Promise<Photo | undefined> {
  const s = params.signature;
  if (!s) return undefined;
  if (s.storageUrl && s.storagePath) return { ...s, dataUrl: undefined };
  if (!s.dataUrl?.startsWith("data:")) return s;

  const { storagePath, storageUrl } = await uploadReportSignature({
    projectId: params.projectId,
    reportId: params.reportId,
    dataUrl: s.dataUrl,
  });

  return {
    ...s,
    name: "signature.png",
    description: s.description || "Assinatura",
    storageUrl,
    storagePath,
    dataUrl: undefined,
  };
}

