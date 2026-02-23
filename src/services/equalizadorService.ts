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

// Interface para Memorando de Serviços (MDS)
export interface ServiceMDS {
  id?: string;
  mdsNumber?: string; // Número único do MDS (formato: MDS-YYYYMMDD-XXXXX)

  // Informações da Obra
  client: string;
  workLocation: string;
  visitDate: string;
  technicalResponsible: string;

  // Escopo de Fornecimento
  serviceDescription: string;
  pipeMaterials: string[];
  pipeDiameters: string[];
  pipeLength: string;
  installationType: string; // Nova | Retrofit
  installationArea: string; // Externa | Interna | Interno e externo
  installationMethod: string[];
  pipeHeight: string[];
  installationPoints: string;
  executionDeadline: string;
  workSchedule: string[];

  // Quadro de Responsabilidades (como JSON)
  responsibilityMatrix?: {
    [key: string]: string; // key = item, value = responsável (Cliente | Hidrodema | Terceiro)
  };

  // Status e Metadados
  status: "awaiting-quotes" | "open" | "lost" | "completed";
  formData: { [key: string]: string | string[] };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Interface para Cotações
export interface MDSQuotation {
  id?: string;
  mdsId: string; // ID do MDS vinculado
  mdsNumber?: string; // Número do MDS para referência
  provider: string;
  value: number;
  date: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface para Comentários
export interface MDSComment {
  id?: string;
  mdsId: string; // ID do MDS vinculado
  mdsNumber?: string; // Número do MDS para referência
  text: string;
  author: string;
  createdAt: string;
}

const MDS_COLLECTION = "serviceMDS";
const QUOTATIONS_COLLECTION = "mdsQuotations";
const COMMENTS_COLLECTION = "mdsComments";

export const createServiceMDS = async (
  mdsData: Omit<ServiceMDS, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();

    const cleanData = Object.fromEntries(
      Object.entries({ ...mdsData }).filter(([, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, MDS_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar MDS:", error);
    throw error;
  }
};

export const getServiceMDSById = async (
  id: string
): Promise<ServiceMDS | null> => {
  try {
    const docRef = doc(db, MDS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as ServiceMDS;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar MDS:", error);
    throw error;
  }
};

export const getServiceMDSByNumber = async (
  mdsNumber: string
): Promise<ServiceMDS | null> => {
  try {
    const q = query(
      collection(db, MDS_COLLECTION),
      where("mdsNumber", "==", mdsNumber)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as ServiceMDS;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar MDS por número:", error);
    throw error;
  }
};

/**
 * Listar todos os MDS
 */
export const getAllServiceMDS = async (): Promise<ServiceMDS[]> => {
  try {
    const q = query(
      collection(db, MDS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ServiceMDS[];
  } catch (error) {
    console.error("Erro ao listar MDS:", error);
    throw error;
  }
};

/**
 * Listar MDS por status
 */
export const getServiceMDSByStatus = async (
  status: ServiceMDS["status"]
): Promise<ServiceMDS[]> => {
  try {
    const q = query(
      collection(db, MDS_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ServiceMDS[];
  } catch (error) {
    console.error("Erro ao listar MDS por status:", error);
    throw error;
  }
};

/**
 * Listar MDS por cliente
 */
export const getServiceMDSByClient = async (
  clientName: string
): Promise<ServiceMDS[]> => {
  try {
    const q = query(
      collection(db, MDS_COLLECTION),
      where("client", "==", clientName),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ServiceMDS[];
  } catch (error) {
    console.error("Erro ao listar MDS por cliente:", error);
    throw error;
  }
};

/**
 * Atualizar MDS
 */
export const updateServiceMDS = async (
  id: string,
  updates: Partial<ServiceMDS>
): Promise<void> => {
  try {
    const docRef = doc(db, MDS_COLLECTION, id);

    // Remover campos undefined (Firebase não aceita)
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar MDS:", error);
    throw error;
  }
};

/**
 * Deletar MDS
 */
export const deleteServiceMDS = async (id: string): Promise<void> => {
  try {
    // Deletar MDS
    const docRef = doc(db, MDS_COLLECTION, id);
    await deleteDoc(docRef);

    // Deletar cotações relacionadas
    const quotationsQuery = query(
      collection(db, QUOTATIONS_COLLECTION),
      where("mdsId", "==", id)
    );
    const quotationsSnapshot = await getDocs(quotationsQuery);
    quotationsSnapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Deletar comentários relacionados
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where("mdsId", "==", id)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error("Erro ao deletar MDS:", error);
    throw error;
  }
};

// ===== COTAÇÕES =====

/**
 * Adicionar cotação a um MDS
 */
export const addMDSQuotation = async (
  quotationData: Omit<MDSQuotation, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();

    // Remover campos undefined (Firebase não aceita)
    const cleanData = Object.fromEntries(
      Object.entries({ ...quotationData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, QUOTATIONS_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar cotação:", error);
    throw error;
  }
};

/**
 * Buscar cotações por MDS ID
 */
export const getQuotationsByMDSId = async (
  mdsId: string
): Promise<MDSQuotation[]> => {
  try {
    const q = query(
      collection(db, QUOTATIONS_COLLECTION),
      where("mdsId", "==", mdsId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MDSQuotation[];
  } catch (error) {
    console.error("Erro ao buscar cotações:", error);
    throw error;
  }
};

/**
 * Buscar cotações por MDS Number
 */
export const getQuotationsByMDSNumber = async (
  mdsNumber: string
): Promise<MDSQuotation[]> => {
  try {
    const q = query(
      collection(db, QUOTATIONS_COLLECTION),
      where("mdsNumber", "==", mdsNumber),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MDSQuotation[];
  } catch (error) {
    console.error("Erro ao buscar cotações por número:", error);
    throw error;
  }
};

/**
 * Atualizar cotação
 */
export const updateMDSQuotation = async (
  id: string,
  updates: Partial<MDSQuotation>
): Promise<void> => {
  try {
    const docRef = doc(db, QUOTATIONS_COLLECTION, id);

    // Remover campos undefined (Firebase não aceita)
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar cotação:", error);
    throw error;
  }
};

/**
 * Deletar cotação
 */
export const deleteMDSQuotation = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, QUOTATIONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar cotação:", error);
    throw error;
  }
};

/**
 * Aprovar cotação (e rejeitar as outras do mesmo MDS)
 */
export const approveMDSQuotation = async (
  quotationId: string,
  mdsId: string
): Promise<void> => {
  try {
    // Aprovar a cotação selecionada
    await updateMDSQuotation(quotationId, { status: "approved" });

    // Rejeitar as outras cotações do mesmo MDS
    const allQuotations = await getQuotationsByMDSId(mdsId);
    for (const quotation of allQuotations) {
      if (quotation.id !== quotationId && quotation.status === "pending") {
        await updateMDSQuotation(quotation.id!, { status: "rejected" });
      }
    }

    // Atualizar status do MDS para "open"
    await updateServiceMDS(mdsId, { status: "open" });
  } catch (error) {
    console.error("Erro ao aprovar cotação:", error);
    throw error;
  }
};

// ===== COMENTÁRIOS =====

/**
 * Adicionar comentário a um MDS
 */
export const addMDSComment = async (
  commentData: Omit<MDSComment, "id" | "createdAt">
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
 * Buscar comentários por MDS ID
 * (Query sem orderBy para não exigir índice composto no Firestore; ordenação em memória.)
 */
export const getCommentsByMDSId = async (
  mdsId: string
): Promise<MDSComment[]> => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("mdsId", "==", mdsId)
    );
    const querySnapshot = await getDocs(q);

    const comments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MDSComment[];
    return comments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    throw error;
  }
};

/**
 * Buscar comentários por MDS Number
 * (Query sem orderBy para não exigir índice composto no Firestore; ordenação em memória.)
 */
export const getCommentsByMDSNumber = async (
  mdsNumber: string
): Promise<MDSComment[]> => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("mdsNumber", "==", mdsNumber)
    );
    const querySnapshot = await getDocs(q);

    const comments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MDSComment[];
    return comments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Erro ao buscar comentários por número:", error);
    throw error;
  }
};

/**
 * Deletar comentário
 */
export const deleteMDSComment = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    throw error;
  }
};

// ===== UTILITÁRIOS =====

/**
 * Gerar número único para MDS (formato: MDS-YYYYMMDD-XXXXX)
 */
export const generateMDSNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `MDS-${year}${month}${day}-${random}`;
};

/**
 * Obter estatísticas dos MDS
 */
export const getMDSStatistics = async () => {
  try {
    const allMDS = await getAllServiceMDS();

    return {
      total: allMDS.length,
      awaitingQuotes: allMDS.filter((m) => m.status === "awaiting-quotes")
        .length,
      open: allMDS.filter((m) => m.status === "open").length,
      completed: allMDS.filter((m) => m.status === "completed").length,
      lost: allMDS.filter((m) => m.status === "lost").length,
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    throw error;
  }
};
