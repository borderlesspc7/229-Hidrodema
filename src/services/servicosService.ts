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
  arrayUnion,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import { sortByCreatedAtDesc } from "../lib/firestoreSort";
import type { User } from "../types/user";
import { hasMacroVisibility, userOwnsServiceRequest } from "../lib/rbac";
import { extractSellerCode } from "../lib/sellerIdentity";

// Interface para Solicitação de Serviço
export interface ServiceRequest {
  id?: string;
  requestId?: string; // ID único da solicitação (formato: SERV-YYYYMMDD-XXXXX)

  // Identificação
  category: string;
  requestDate: string;

  // Dados do Solicitante
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;

  // Acompanhamento Interno
  internalName: string;
  internalEmail: string;
  clientSegment: string;
  hasOrderOrProposal: string;
  orderOrProposalNumber?: string;
  regional: string;
  salesperson: string;

  // Dados Cadastrais
  company: string;
  clientCode?: string;
  cnpj: string;

  // Serviço
  urgencyLevel: string;
  serviceType: string;
  serviceDescription: string;

  // Status e Metadados
  status:
    | "draft"
    | "submitted"
    | "needs-review"
    | "in-progress"
    | "completed"
    | "rejected"
    | "cancelled";
  /** Observação técnica (somente internos / macro). */
  technicalNote?: string;
  /** Histórico de mudanças de status para timeline. */
  statusHistory?: Array<{
    at: string;
    from?: ServiceRequest["status"];
    to: ServiceRequest["status"];
    byUid?: string;
    byEmail?: string;
    note?: string;
  }>;
  formData: { [key: string]: string | string[] };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  ownerUid?: string;
  ownerSellerCode?: string;
}

// Interface para Comentários
export interface ServiceComment {
  id?: string;
  requestId: string;
  text: string;
  author: string;
  createdAt: string;
}

const REQUESTS_COLLECTION = "serviceRequests";
const COMMENTS_COLLECTION = "serviceComments";

// ===== SOLICITAÇÕES DE SERVIÇOS =====

export const createServiceRequest = async (
  requestData: Omit<ServiceRequest, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();

    const cleanData = Object.fromEntries(
      Object.entries({ ...requestData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const ownerSellerCode = extractSellerCode((requestData as any).salesperson);
    const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), {
      ...cleanData,
      ownerUid: (requestData as any).createdBy ?? undefined,
      ownerSellerCode: ownerSellerCode ?? undefined,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar solicitação de serviço:", error);
    throw error;
  }
};

export const getServiceRequestById = async (
  id: string
): Promise<ServiceRequest | null> => {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as ServiceRequest;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar solicitação:", error);
    throw error;
  }
};

/**
 * Buscar solicitação de serviço por requestId (ID único gerado)
 */
export const getServiceRequestByRequestId = async (
  requestId: string
): Promise<ServiceRequest | null> => {
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
      } as ServiceRequest;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar solicitação por requestId:", error);
    throw error;
  }
};

/**
 * Listar todas as solicitações de serviços
 */
export const getAllServiceRequests = async (): Promise<ServiceRequest[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, REQUESTS_COLLECTION));
    const rows = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ServiceRequest[];
    return sortByCreatedAtDesc(rows);
  } catch (error) {
    console.error("Erro ao listar solicitações:", error);
    throw error;
  }
};

export async function getServiceRequestsScoped(
  user: User | null
): Promise<ServiceRequest[]> {
  if (!user) return [];
  if (hasMacroVisibility(user)) return getAllServiceRequests();

  const rows: ServiceRequest[] = [];
  const q1 = query(
    collection(db, REQUESTS_COLLECTION),
    where("createdBy", "==", user.uid)
  );
  const s1 = await getDocs(q1);
  rows.push(...(s1.docs.map((d) => ({ id: d.id, ...d.data() })) as ServiceRequest[]));

  if (user.sellerCode?.trim()) {
    const q2 = query(
      collection(db, REQUESTS_COLLECTION),
      where("ownerSellerCode", "==", user.sellerCode.trim())
    );
    const s2 = await getDocs(q2);
    rows.push(...(s2.docs.map((d) => ({ id: d.id, ...d.data() })) as ServiceRequest[]));
  }

  const byId = new Map<string, ServiceRequest>();
  for (const r of rows) {
    if (!r.id) continue;
    byId.set(r.id, r);
  }

  // Segurança extra: se algum registro entrou por engano, filtra localmente.
  return sortByCreatedAtDesc(
    Array.from(byId.values()).filter((r) => userOwnsServiceRequest(user, r))
  );
}

/**
 * Listar solicitações por status
 */
export const getServiceRequestsByStatus = async (
  status: ServiceRequest["status"]
): Promise<ServiceRequest[]> => {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where("status", "==", status)
    );
    const querySnapshot = await getDocs(q);

    const rows = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ServiceRequest[];
    return sortByCreatedAtDesc(rows);
  } catch (error) {
    console.error("Erro ao listar solicitações por status:", error);
    throw error;
  }
};

/**
 * Atualizar solicitação de serviço
 */
export const updateServiceRequest = async (
  id: string,
  updates: Partial<ServiceRequest>
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
 * Transição de status com trilha de auditoria (timeline) e suporte a observação.
 * Use no UI para manter `statusHistory`.
 */
export async function transitionServiceRequestStatus(params: {
  id: string;
  from?: ServiceRequest["status"];
  to: ServiceRequest["status"];
  actor?: { uid?: string; email?: string };
  note?: string;
}): Promise<void> {
  const ref = doc(db, REQUESTS_COLLECTION, params.id);
  const at = new Date().toISOString();
  await updateDoc(ref, {
    status: params.to,
    updatedAt: at,
    statusHistory: arrayUnion({
      at,
      from: params.from,
      to: params.to,
      byUid: params.actor?.uid,
      byEmail: params.actor?.email,
      note: params.note,
    }),
  });
}

export const deleteServiceRequest = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar solicitação:", error);
    throw error;
  }
};

export const addServiceComment = async (
  commentData: Omit<ServiceComment, "id" | "createdAt">
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
export const getServiceCommentsByRequestId = async (
  requestId: string
): Promise<ServiceComment[]> => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("requestId", "==", requestId)
    );
    const querySnapshot = await getDocs(q);

    const rows = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ServiceComment[];
    return sortByCreatedAtDesc(rows);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    throw error;
  }
};

/**
 * Deletar comentário
 */
export const deleteServiceComment = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    throw error;
  }
};

/**
 * Gerar ID único para solicitação (formato: SERV-YYYYMMDD-XXXXX)
 */
export const generateServiceRequestId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `SERV-${year}${month}${day}-${random}`;
};
