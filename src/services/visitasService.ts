import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../lib/firebaseconfig";
import { sortByCreatedAtDesc } from "../lib/firestoreSort";
import type { User } from "../types/user";
import {
  filterVisitReportsForUser,
  filterVisitRequestsForUser,
} from "../lib/rbac";
import { extractSellerCode } from "../lib/sellerIdentity";

// Interface para Solicitação de Visita
export interface VisitRequest {
  id?: string;
  requestId?: string; // ID único da solicitação para referência
  regional: string;
  vendedor: string;
  clientName: string;
  clientCNPJ?: string;
  clientCode?: string;
  municipality: string;
  clientContact: string;
  visitType: string;
  visitReason: string;
  visitAddress: string;
  visitDate: string;
  visitPeriod: string;
  responsibleSalesperson: string;
  status: "pending" | "scheduled" | "awaiting-report" | "completed" | "cancelled";
  hasReport: boolean;
  formData: { [key: string]: string | string[] };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  ownerUid?: string;
  ownerSellerCode?: string;
}

// Interface para Relatório de Visita
export interface VisitReport {
  id?: string;
  requestId: string; // ID da solicitação vinculada
  createdBy?: string;
  visitDate: string;
  isOnline: boolean;
  participants: string[];
  mainTheme: string;
  reportText: string;
  emotionalPoints: string[];
  nextAction: string;
  followUpDate: string;
  // Workflow obrigatório (provas de campo)
  checkInAt?: string;
  checkInGeo?: { latitude: number; longitude: number; accuracy?: number };
  checkOutAt?: string;
  checkOutGeo?: { latitude: number; longitude: number; accuracy?: number };
  photos?: { id: string; storagePath: string; storageUrl: string; uploadedAt: string; name?: string }[];
  formData: { [key: string]: string | string[] };
  createdAt: string;
  updatedAt: string;
  ownerUid?: string;
  ownerSellerCode?: string;
}

// Interface para Comentários
export interface VisitComment {
  id?: string;
  requestId: string;
  text: string;
  author: string;
  createdAt: string;
}

const REQUESTS_COLLECTION = "visitRequests";
const REPORTS_COLLECTION = "visitReports";
const COMMENTS_COLLECTION = "visitComments";

// ===== SOLICITAÇÕES DE VISITAS =====

/**
 * Criar uma nova solicitação de visita
 */
export const createVisitRequest = async (
  requestData: Omit<VisitRequest, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();

    // Firestore rejeita `undefined`. Construímos o payload omitindo campos
    // ausentes em vez de defini-los como undefined.
    const cleanData = Object.fromEntries(
      Object.entries({ ...requestData }).filter(([, value]) => value !== undefined)
    );

    // `createdBy` é OBRIGATÓRIO pelas rules — fallback no auth.currentUser
    // garante que o doc não nasça sem ele se o caller esqueceu de passar.
    const createdBy =
      ((requestData as any).createdBy as string | undefined) ??
      auth.currentUser?.uid;
    if (!createdBy) {
      throw new Error(
        "Usuário não autenticado. Faça login novamente para salvar a solicitação."
      );
    }

    const ownerSellerCode = extractSellerCode((requestData as any).vendedor);
    const payload: Record<string, unknown> = {
      ...cleanData,
      createdBy,
      ownerUid: createdBy,
      createdAt: now,
      updatedAt: now,
    };
    if (ownerSellerCode) payload.ownerSellerCode = ownerSellerCode;

    const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), payload);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar solicitação de visita:", error);
    throw error;
  }
};

/**
 * Buscar solicitação de visita por ID do documento
 */
export const getVisitRequestById = async (
  id: string
): Promise<VisitRequest | null> => {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as VisitRequest;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar solicitação:", error);
    throw error;
  }
};

/**
 * Buscar solicitação de visita por requestId (ID único gerado)
 */
export const getVisitRequestByRequestId = async (
  requestId: string
): Promise<VisitRequest | null> => {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where("requestId", "==", requestId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as VisitRequest;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar solicitação por requestId:", error);
    throw error;
  }
};

/**
 * Listar todas as solicitações de visitas
 */
export const getAllVisitRequests = async (): Promise<VisitRequest[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, REQUESTS_COLLECTION));
    const rows = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VisitRequest[];
    return sortByCreatedAtDesc(rows);
  } catch (error) {
    console.error("Erro ao listar solicitações:", error);
    throw error;
  }
};

/**
 * Atualizar solicitação de visita
 */
export const updateVisitRequest = async (
  id: string,
  updates: Partial<VisitRequest>
): Promise<void> => {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, id);
    
    // Remover campos undefined (Firebase não aceita)
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );
    
    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar solicitação:", error);
    throw error;
  }
};

/**
 * Deletar solicitação de visita
 */
export const deleteVisitRequest = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar solicitação:", error);
    throw error;
  }
};

// ===== RELATÓRIOS DE VISITAS =====

/**
 * Criar um novo relatório de visita
 */
export const createVisitReport = async (
  reportData: Omit<VisitReport, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();

    // Firestore rejeita `undefined`. Construímos o payload omitindo campos
    // ausentes em vez de defini-los como undefined.
    const cleanData = Object.fromEntries(
      Object.entries({ ...reportData }).filter(([, value]) => value !== undefined)
    );

    const request = await getVisitRequestByRequestId(reportData.requestId);
    const ownerSellerCode =
      (request?.ownerSellerCode as string | undefined) ??
      extractSellerCode(request?.vendedor);
    const ownerUid = (request?.ownerUid ?? request?.createdBy) as
      | string
      | undefined;

    const payload: Record<string, unknown> = {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    };
    if (ownerUid) payload.ownerUid = ownerUid;
    if (ownerSellerCode) payload.ownerSellerCode = ownerSellerCode;

    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), payload);

    // Atualizar a solicitação para indicar que tem relatório
    if (request && request.id) {
      await updateVisitRequest(request.id, {
        hasReport: true,
        status: "completed",
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar relatório de visita:", error);
    throw error;
  }
};

/**
 * Buscar relatório de visita por ID
 */
export const getVisitReportById = async (
  id: string
): Promise<VisitReport | null> => {
  try {
    const docRef = doc(db, REPORTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as VisitReport;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar relatório:", error);
    throw error;
  }
};

/**
 * Buscar relatório de visita por requestId
 */
export const getVisitReportByRequestId = async (
  requestId: string
): Promise<VisitReport | null> => {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where("requestId", "==", requestId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as VisitReport;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar relatório por requestId:", error);
    throw error;
  }
};

/**
 * Listar todos os relatórios de visitas
 */
export const getAllVisitReports = async (): Promise<VisitReport[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, REPORTS_COLLECTION));
    const rows = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VisitReport[];
    return sortByCreatedAtDesc(rows);
  } catch (error) {
    console.error("Erro ao listar relatórios:", error);
    throw error;
  }
};

/**
 * Atualizar relatório de visita
 */
export const updateVisitReport = async (
  id: string,
  updates: Partial<VisitReport>
): Promise<void> => {
  try {
    const docRef = doc(db, REPORTS_COLLECTION, id);
    
    // Remover campos undefined (Firebase não aceita)
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );
    
    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar relatório:", error);
    throw error;
  }
};

/**
 * Deletar relatório de visita
 */
export const deleteVisitReport = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, REPORTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar relatório:", error);
    throw error;
  }
};

// ===== COMENTÁRIOS =====

/**
 * Adicionar comentário a uma solicitação
 */
export const addComment = async (
  commentData: Omit<VisitComment, "id" | "createdAt">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
      ...commentData,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    throw error;
  }
};

/**
 * Buscar comentários por requestId
 */
export const getCommentsByRequestId = async (
  requestId: string
): Promise<VisitComment[]> => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("requestId", "==", requestId)
    );
    const querySnapshot = await getDocs(q);
    const rows = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VisitComment[];
    return sortByCreatedAtDesc(rows);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    throw error;
  }
};

/**
 * Deletar comentário
 */
export const deleteComment = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    throw error;
  }
};

/**
 * Gerar ID único para solicitação (formato: REQ-YYYYMMDD-XXXXX)
 */
export const generateRequestId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `REQ-${year}${month}${day}-${random}`;
};

/** Índice completo para checagem de permissão no relatório (pai da solicitação). */
export async function loadVisitDataScoped(user: User | null): Promise<{
  requests: VisitRequest[];
  reports: VisitReport[];
  byRequestId: Map<string, VisitRequest>;
}> {
  // Normaliza role pra evitar problemas com dados legados ("admin ", "Admin").
  const rawRole = (user?.role ?? "").toString();
  const normalizedRole = rawRole.trim().toLowerCase();
  const isMacro = normalizedRole === "admin" || normalizedRole === "gestor";
  // Diagnóstico: ajuda a entender por que a rule do servidor pode bloquear.
  if (typeof window !== "undefined") {
    try {
      console.info(
        "[loadVisitDataScoped] user check",
        JSON.stringify({
          uid: user?.uid ?? null,
          email: user?.email ?? null,
          rawRole,
          rawRoleHex: Array.from(rawRole)
            .map((c) => c.charCodeAt(0).toString(16))
            .join(" "),
          normalizedRole,
          isMacro,
        })
      );
    } catch {
      // Ignora qualquer erro de serialização — é só log.
    }
  }
  const [allReq, allRep] = await Promise.all([
    isMacro ? getAllVisitRequests() : getVisitRequestsForUser(user),
    isMacro ? getAllVisitReports() : getVisitReportsForUser(user),
  ]);
  const byRequestId = new Map<string, VisitRequest>();
  for (const r of allReq) {
    if (r.requestId) byRequestId.set(r.requestId, r);
  }
  if (!user) {
    return { requests: [], reports: [], byRequestId };
  }
  const requests = isMacro ? allReq : filterVisitRequestsForUser(user, allReq);
  const reports = isMacro ? allRep : filterVisitReportsForUser(user, allRep, byRequestId);
  return { requests, reports, byRequestId };
}

async function getVisitRequestsForUser(user: User | null): Promise<VisitRequest[]> {
  if (!user?.uid) return [];
  const snaps: VisitRequest[] = [];

  const q1 = query(
    collection(db, REQUESTS_COLLECTION),
    where("createdBy", "==", user.uid)
  );
  const s1 = await getDocs(q1);
  snaps.push(
    ...(s1.docs.map((d) => ({ id: d.id, ...d.data() })) as VisitRequest[])
  );

  if (user.sellerCode?.trim()) {
    const q2 = query(
      collection(db, REQUESTS_COLLECTION),
      where("ownerSellerCode", "==", user.sellerCode.trim())
    );
    const s2 = await getDocs(q2);
    snaps.push(
      ...(s2.docs.map((d) => ({ id: d.id, ...d.data() })) as VisitRequest[])
    );
  }

  // dedupe
  const byId = new Map<string, VisitRequest>();
  for (const r of snaps) {
    if (!r.id) continue;
    byId.set(r.id, r);
  }
  return sortByCreatedAtDesc(Array.from(byId.values()));
}

async function getVisitReportsForUser(user: User | null): Promise<VisitReport[]> {
  if (!user?.uid) return [];
  const snaps: VisitReport[] = [];

  const q1 = query(
    collection(db, REPORTS_COLLECTION),
    where("createdBy", "==", user.uid)
  );
  const s1 = await getDocs(q1);
  snaps.push(
    ...(s1.docs.map((d) => ({ id: d.id, ...d.data() })) as VisitReport[])
  );

  if (user.sellerCode?.trim()) {
    const q2 = query(
      collection(db, REPORTS_COLLECTION),
      where("ownerSellerCode", "==", user.sellerCode.trim())
    );
    const s2 = await getDocs(q2);
    snaps.push(
      ...(s2.docs.map((d) => ({ id: d.id, ...d.data() })) as VisitReport[])
    );
  }

  const byId = new Map<string, VisitReport>();
  for (const r of snaps) {
    if (!r.id) continue;
    byId.set(r.id, r);
  }
  return sortByCreatedAtDesc(Array.from(byId.values()));
}
