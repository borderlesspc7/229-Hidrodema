import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../lib/firebaseconfig";
import type { AttachmentFile } from "../types/obrasGerenciamentoModule";

function attachmentPath(projectId: string, reportId: string, attachmentId: string, fileName: string): string {
  const safe = (s: string) => s.replace(/[^\w.\-()\s]/g, "_");
  return `obras/reports/${safe(projectId)}/${safe(reportId)}/attachments/${safe(attachmentId)}_${safe(fileName)}`;
}

export async function uploadReportAttachment(params: {
  projectId: string;
  reportId: string;
  file: File;
  uploadedByEmail?: string;
}): Promise<AttachmentFile> {
  const id = `${Date.now()}`;
  const path = attachmentPath(params.projectId, params.reportId, id, params.file.name);
  const ref = storageRef(storage, path);
  await uploadBytes(ref, params.file, { contentType: params.file.type || undefined });
  const storageUrl = await getDownloadURL(ref);
  return {
    id,
    name: params.file.name,
    mimeType: params.file.type || "application/octet-stream",
    sizeBytes: params.file.size,
    uploadedAt: new Date().toISOString(),
    uploadedByEmail: params.uploadedByEmail,
    storageUrl,
    storagePath: path,
  };
}

export async function deleteReportAttachment(attachment: Pick<AttachmentFile, "storagePath">): Promise<void> {
  try {
    await deleteObject(storageRef(storage, attachment.storagePath));
  } catch {
    // já removido ou sem permissão
  }
}

