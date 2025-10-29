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
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";

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
  status: "pending" | "scheduled" | "completed" | "cancelled";
  hasReport: boolean;
  formData: { [key: string]: string | string[] };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Interface para Relatório de Visita
export interface VisitReport {
  id?: string;
  requestId: string; // ID da solicitação vinculada
  visitDate: string;
  isOnline: boolean;
  participants: string[];
  mainTheme: string;
  reportText: string;
  emotionalPoints: string[];
  nextAction: string;
  followUpDate: string;
  formData: { [key: string]: string | string[] };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
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
    const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), {
      ...requestData,
      createdAt: now,
      updatedAt: now,
    });
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
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VisitRequest[];
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
    await updateDoc(docRef, {
      ...updates,
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
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
      ...reportData,
      createdAt: now,
      updatedAt: now,
    });

    // Atualizar a solicitação para indicar que tem relatório
    const request = await getVisitRequestByRequestId(reportData.requestId);
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
    const q = query(
      collection(db, REPORTS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VisitReport[];
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
    await updateDoc(docRef, {
      ...updates,
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
      where("requestId", "==", requestId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VisitComment[];
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
