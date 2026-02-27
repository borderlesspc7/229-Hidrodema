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

// ===== INTERFACES =====

export interface Project {
  id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "planejamento" | "em-andamento" | "concluida" | "pausada";
  budget: number;
  spent: number;
  progress: number;
  milestones: Milestone[];
  team: string[];
  labor?: string;
  client: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: "pendente" | "em-andamento" | "concluida" | "atrasada";
  progress: number;
  dependencies: string[];
}

// Tipos de relatório disponíveis
export type ReportType =
  | "rdo"
  | "lancamento-gastos"
  | "teste-hidrostatico"
  | "conclusao-obra";

export interface DiaryEntry {
  id?: string;
  projectId: string; // ID do projeto relacionado (obrigatório)
  reportType: ReportType; // Tipo do relatório
  reportNumber?: number; // Número sequencial do relatório
  obraName: string;
  date: string;
  dayOfWeek?: string; // Dia da semana

  // Campos específicos do RDO
  workSchedule?: WorkSchedule; // Horário de trabalho
  workforce?: WorkforceEntry[]; // Mão de obra
  equipmentUsed?: EquipmentUsage[]; // Equipamentos utilizados
  activities: string;
  activitiesList?: ActivityEntry[]; // Lista de atividades detalhadas
  occurrences?: OccurrenceEntry[]; // Ocorrências
  comments?: CommentEntry[]; // Comentários

  // Campos específicos de Lançamento de Gastos
  expenses?: ExpenseEntry[]; // Lista de gastos

  // Campos específicos de Teste Hidrostático
  testItems?: HydrostaticTestItem[]; // Itens testados
  testParameters?: TestParameter[]; // Parâmetros de teste (pressão, horários)

  // Campos específicos de Conclusão de Obra
  conclusionActivities?: ConclusionActivityEntry[]; // Atividades com status específicos
  conclusionOccurrences?: ConclusionOccurrenceEntry[]; // Ocorrências com tags
  signatures?: SignatureEntry[]; // Múltiplas assinaturas (empresa e cliente)

  // Anexos (PDFs e outros arquivos)
  attachments?: DiaryAttachment[];

  // Campos comuns
  materials: Material[];
  photos: Photo[];
  videos?: VideoEntry[]; // Vídeos
  observations: string;
  weather: string;
  responsible: string;

  // Aprovação e assinatura
  approvalStatus: "preenchendo" | "revisao" | "aprovado";
  signature?: string; // Assinatura digital (base64) - mantido para compatibilidade
  signedBy?: string;
  signedAt?: string;

  status: "em-andamento" | "concluida" | "pausada";
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  viewCount?: number;
  editLog?: EditLogEntry[];
}

// Horário de trabalho
export interface WorkSchedule {
  entryTime: string; // Entrada (ex: 08:00)
  exitTime: string; // Saída (ex: 18:00)
  breakStart: string; // Intervalo entrada (ex: 12:00)
  breakEnd: string; // Intervalo saída (ex: 13:00)
  totalHours?: string; // Calculado automaticamente
}

// Entrada de mão de obra
export interface WorkforceEntry {
  id: string;
  name: string;
  company: string;
  quantity: number;
}

// Uso de equipamento
export interface EquipmentUsage {
  id: string;
  name: string;
  code: string;
  quantity: number;
}

// Entrada de atividade detalhada
export interface ActivityEntry {
  id: string;
  description: string;
  progress: number; // Porcentagem (0-100)
  status: "em-andamento" | "concluido" | "pausado";
  details?: string; // Detalhes adicionais
  quantity?: number; // Quantidade feita
}

// Entrada de ocorrência
export interface OccurrenceEntry {
  id: string;
  description: string;
  type: "acidente" | "atraso" | "falta-material" | "clima" | "outro";
  severity: "baixa" | "media" | "alta";
  date: string;
}

// Entrada de comentário
export interface CommentEntry {
  id: string;
  author: string;
  text: string;
  date: string;
}

// Entrada de gasto (para Lançamento de Gastos)
export interface ExpenseEntry {
  id: string;
  description: string;
  value: number;
  category: string;
  date: string;
  receipt?: string; // URL ou base64 do comprovante
}

// Entrada de vídeo
export interface VideoEntry {
  id: string;
  name: string;
  description: string;
  dataUrl: string;
  duration?: number; // em segundos
  size?: number; // em bytes
}

// Log de edições
export interface EditLogEntry {
  id: string;
  action: string;
  user: string;
  date: string;
}

// Item de teste hidrostático
export interface HydrostaticTestItem {
  id: string;
  itemName: string; // Ex: "Spool: ACQUASAN 8" x 2.1/2" - 53""
  testParameters: TestParameter[]; // Parâmetros de teste (pressão, horários)
  result: "aprovado" | "reprovado" | "pendente";
  notes?: string; // Observações adicionais
}

// Parâmetro de teste (pressão e horário)
export interface TestParameter {
  id: string;
  pressure: number; // Pressão em bar
  startTime: string; // Horário de início (ex: "08:00")
  endTime: string; // Horário de fim (ex: "08:10")
}

// Atividade para Relatório de Conclusão de Obra
export interface ConclusionActivityEntry {
  id: string;
  description: string;
  progress: number; // Porcentagem (0-100)
  status:
    | "iniciada"
    | "em-andamento"
    | "concluida"
    | "nao-iniciada"
    | "paralisada"
    | "nao-executada";
  details?: string; // Detalhes adicionais
}

// Ocorrência para Relatório de Conclusão de Obra (com tags)
export interface ConclusionOccurrenceEntry {
  id: string;
  description: string;
  tags: string[]; // Tags selecionadas
  date: string;
}

// Assinatura múltipla (empresa e cliente)
export interface SignatureEntry {
  id: string;
  name: string;
  company: string;
  signature?: string; // Assinatura digital (base64)
  signedAt?: string;
  role: "empresa" | "cliente"; // Tipo de assinatura
}

// Tags disponíveis para ocorrências
export const OCCURRENCE_TAGS = [
  "Acidente de trabalho",
  "Alteração de projeto",
  "Dia Chuvoso",
  "Falta de equipamento",
  "Falta de material",
  "Falta de mão de obra",
  "Retrabalho",
  "Solicitação fora do escopo",
  "Solicitações do cliente",
] as const;

export interface Material {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  price?: number;
  supplier?: string;
  supplierId?: string; // ID do fornecedor relacionado
  category?: string;
}

/** Anexo de relatório (PDF ou outro arquivo) armazenado por URL. */
export interface DiaryAttachment {
  id: string;
  name: string;
  fileUrl: string;
}

export interface Photo {
  id: string;
  name: string;
  description: string;
  dataUrl: string;
}

export interface InventoryItem {
  id?: string;
  projectId?: string; // ID do projeto relacionado (opcional - pode ser compartilhado)
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string;
  supplierId?: string; // ID do fornecedor relacionado
  location: string;
  lastUpdated: string;
  alerts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id?: string;
  projectId: string; // ID do projeto relacionado
  name: string;
  description: string;
  totalAmount: number;
  spentAmount: number;
  categories: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
  supplierId?: string; // ID do fornecedor relacionado
  status: "pendente" | "aprovado" | "comprado" | "entregue";
}

export interface Supplier {
  id?: string;
  projectId?: string; // ID do projeto relacionado (opcional - pode ser compartilhado)
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  reliability: "excelente" | "bom" | "regular" | "ruim";
  deliveryTime: number;
  paymentTerms: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface QualityChecklist {
  id?: string;
  projectId: string; // ID do projeto relacionado
  name: string;
  description: string;
  items: QualityItem[];
  status: "pendente" | "em-andamento" | "concluida";
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface QualityItem {
  id: string;
  description: string;
  status: "pendente" | "aprovado" | "reprovado";
  notes: string;
  responsible: string;
  checkedAt: string;
}

export interface TeamMember {
  id?: string;
  projectId?: string; // ID do projeto relacionado (opcional - pode trabalhar em múltiplas obras)
  name: string;
  role: string;
  cpf?: string;
  phone?: string;
  workHours?: number;
  hourlyRate?: number;
  attendance?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id?: string;
  name: string;
  type: string;
  code?: string;
  status: "disponivel" | "em-uso" | "manutencao" | "quebrado";
  projectId?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  operator?: string;
  hoursUsed?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id?: string;
  projectId: string;
  taskName: string;
  startDate: string;
  endDate: string;
  progress: number;
  responsible?: string;
  dependencies?: string[];
  status: "nao-iniciado" | "em-andamento" | "concluido" | "atrasado";
  plannedCost?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SafetyRecord {
  id?: string;
  projectId: string;
  date: string;
  type: "dds" | "inspecao" | "acidente" | "treinamento" | "epi";
  title: string;
  description: string;
  participants?: string[];
  responsible: string;
  severity?: "baixa" | "media" | "alta";
  correctedActions?: string;
  status: "pendente" | "em-andamento" | "concluido";
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id?: string;
  projectId: string;
  date: string;
  period: string;
  description: string;
  plannedPhysicalProgress: number;
  actualPhysicalProgress: number;
  plannedFinancialProgress: number;
  actualFinancialProgress: number;
  observations?: string;
  approved?: boolean;
  approvedBy?: string;
  approvedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id?: string;
  projectId: string;
  date: string;
  title: string;
  description: string;
  category:
    | "tecnico"
    | "financeiro"
    | "prazo"
    | "qualidade"
    | "seguranca"
    | "outro";
  priority: "baixa" | "media" | "alta" | "critica";
  status: "aberto" | "em-analise" | "resolvido" | "cancelado";
  responsible?: string;
  solution?: string;
  solvedDate?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id?: string;
  projectId: string;
  name: string;
  type:
    | "projeto"
    | "art"
    | "contrato"
    | "licenca"
    | "orcamento"
    | "medicao"
    | "outro";
  uploadDate: string;
  fileUrl?: string;
  description?: string;
  version?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== CONSTANTES DE COLLECTIONS =====

const PROJECTS_COLLECTION = "obrasProjects";
const DIARY_ENTRIES_COLLECTION = "obrasDiaryEntries";
const INVENTORY_COLLECTION = "obrasInventory";
const BUDGETS_COLLECTION = "obrasBudgets";
const SUPPLIERS_COLLECTION = "obrasSuppliers";
const QUALITY_CHECKLISTS_COLLECTION = "obrasQualityChecklists";
const TEAM_MEMBERS_COLLECTION = "obrasTeamMembers";
const EQUIPMENT_COLLECTION = "obrasEquipment";
const SCHEDULES_COLLECTION = "obrasSchedules";
const SAFETY_RECORDS_COLLECTION = "obrasSafetyRecords";
const MEASUREMENTS_COLLECTION = "obrasMeasurements";
const ISSUES_COLLECTION = "obrasIssues";
const DOCUMENTS_COLLECTION = "obrasDocuments";

// ===== PROJETOS (OBRAS) =====

export const createProject = async (
  projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...projectData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    throw error;
  }
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Project;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar projeto:", error);
    throw error;
  }
};

export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  } catch (error) {
    console.error("Erro ao listar projetos:", error);
    throw error;
  }
};

export const getProjectsByStatus = async (
  status: Project["status"]
): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  } catch (error) {
    console.error("Erro ao listar projetos por status:", error);
    throw error;
  }
};

export const getProjectsByClient = async (
  client: string
): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where("client", "==", client),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  } catch (error) {
    console.error("Erro ao listar projetos por cliente:", error);
    throw error;
  }
};

export const updateProject = async (
  id: string,
  updates: Partial<Project>
): Promise<void> => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    // Deletar projeto
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);

    // Deletar registros diários relacionados
    const diaryQuery = query(
      collection(db, DIARY_ENTRIES_COLLECTION),
      where("projectId", "==", id)
    );
    const diarySnapshot = await getDocs(diaryQuery);
    diarySnapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Deletar orçamentos relacionados
    const budgetQuery = query(
      collection(db, BUDGETS_COLLECTION),
      where("projectId", "==", id)
    );
    const budgetSnapshot = await getDocs(budgetQuery);
    budgetSnapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Deletar checklists de qualidade relacionados
    const qualityQuery = query(
      collection(db, QUALITY_CHECKLISTS_COLLECTION),
      where("projectId", "==", id)
    );
    const qualitySnapshot = await getDocs(qualityQuery);
    qualitySnapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);
    throw error;
  }
};

// ===== REGISTROS DIÁRIOS (DIARY ENTRIES) =====

export const createDiaryEntry = async (
  entryData: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...entryData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, DIARY_ENTRIES_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar registro diário:", error);
    throw error;
  }
};

export const getDiaryEntryById = async (
  id: string
): Promise<DiaryEntry | null> => {
  try {
    const docRef = doc(db, DIARY_ENTRIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as DiaryEntry;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar registro diário:", error);
    throw error;
  }
};

export const getAllDiaryEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const q = query(
      collection(db, DIARY_ENTRIES_COLLECTION),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DiaryEntry[];
  } catch (error) {
    console.error("Erro ao listar registros diários:", error);
    throw error;
  }
};

export const getDiaryEntriesByProject = async (
  projectId: string
): Promise<DiaryEntry[]> => {
  try {
    const q = query(
      collection(db, DIARY_ENTRIES_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DiaryEntry[];
  } catch (error) {
    console.error("Erro ao listar registros por projeto:", error);
    throw error;
  }
};

export const getDiaryEntriesByObraName = async (
  obraName: string
): Promise<DiaryEntry[]> => {
  try {
    const q = query(
      collection(db, DIARY_ENTRIES_COLLECTION),
      where("obraName", "==", obraName),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DiaryEntry[];
  } catch (error) {
    console.error("Erro ao listar registros por nome da obra:", error);
    throw error;
  }
};

export const updateDiaryEntry = async (
  id: string,
  updates: Partial<DiaryEntry>
): Promise<void> => {
  try {
    const docRef = doc(db, DIARY_ENTRIES_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar registro diário:", error);
    throw error;
  }
};

export const deleteDiaryEntry = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, DIARY_ENTRIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar registro diário:", error);
    throw error;
  }
};

// ===== INVENTÁRIO =====

export const createInventoryItem = async (
  itemData: Omit<
    InventoryItem,
    "id" | "lastUpdated" | "createdAt" | "updatedAt" | "alerts"
  >
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...itemData }).filter(([, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, INVENTORY_COLLECTION), {
      ...cleanData,
      lastUpdated: now,
      createdAt: now,
      updatedAt: now,
      alerts: [],
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar item de inventário:", error);
    throw error;
  }
};

export const getInventoryItemById = async (
  id: string
): Promise<InventoryItem | null> => {
  try {
    const docRef = doc(db, INVENTORY_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as InventoryItem;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar item de inventário:", error);
    throw error;
  }
};

export const getAllInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    const q = query(
      collection(db, INVENTORY_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryItem[];
  } catch (error) {
    console.error("Erro ao listar itens de inventário:", error);
    throw error;
  }
};

export const getInventoryItemsByCategory = async (
  category: string
): Promise<InventoryItem[]> => {
  try {
    const q = query(
      collection(db, INVENTORY_COLLECTION),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryItem[];
  } catch (error) {
    console.error("Erro ao listar itens por categoria:", error);
    throw error;
  }
};

export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  try {
    const allItems = await getAllInventoryItems();
    return allItems.filter((item) => item.quantity <= item.minStock);
  } catch (error) {
    console.error("Erro ao buscar itens com estoque baixo:", error);
    throw error;
  }
};

export const getInventoryItemsByProject = async (
  projectId: string
): Promise<InventoryItem[]> => {
  try {
    const q = query(
      collection(db, INVENTORY_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as InventoryItem[];
  } catch (error) {
    console.error("Erro ao listar itens de inventário por projeto:", error);
    throw error;
  }
};

export const updateInventoryItem = async (
  id: string,
  updates: Partial<InventoryItem>
): Promise<void> => {
  try {
    const docRef = doc(db, INVENTORY_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      lastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar item de inventário:", error);
    throw error;
  }
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, INVENTORY_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar item de inventário:", error);
    throw error;
  }
};

// ===== ORÇAMENTOS =====

export const createBudget = async (
  budgetData: Omit<Budget, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...budgetData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, BUDGETS_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    throw error;
  }
};

export const getBudgetById = async (id: string): Promise<Budget | null> => {
  try {
    const docRef = doc(db, BUDGETS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Budget;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    throw error;
  }
};

export const getAllBudgets = async (): Promise<Budget[]> => {
  try {
    const q = query(
      collection(db, BUDGETS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Budget[];
  } catch (error) {
    console.error("Erro ao listar orçamentos:", error);
    throw error;
  }
};

export const getBudgetsByProject = async (
  projectId: string
): Promise<Budget[]> => {
  try {
    const q = query(
      collection(db, BUDGETS_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Budget[];
  } catch (error) {
    console.error("Erro ao listar orçamentos por projeto:", error);
    throw error;
  }
};

export const updateBudget = async (
  id: string,
  updates: Partial<Budget>
): Promise<void> => {
  try {
    const docRef = doc(db, BUDGETS_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error);
    throw error;
  }
};

export const deleteBudget = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, BUDGETS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar orçamento:", error);
    throw error;
  }
};

// ===== FORNECEDORES =====

export const createSupplier = async (
  supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...supplierData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, SUPPLIERS_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar fornecedor:", error);
    throw error;
  }
};

export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  try {
    const docRef = doc(db, SUPPLIERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Supplier;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar fornecedor:", error);
    throw error;
  }
};

export const getAllSuppliers = async (): Promise<Supplier[]> => {
  try {
    const q = query(
      collection(db, SUPPLIERS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Supplier[];
  } catch (error) {
    console.error("Erro ao listar fornecedores:", error);
    throw error;
  }
};

export const getSuppliersByCategory = async (
  category: string
): Promise<Supplier[]> => {
  try {
    const q = query(
      collection(db, SUPPLIERS_COLLECTION),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Supplier[];
  } catch (error) {
    console.error("Erro ao listar fornecedores por categoria:", error);
    throw error;
  }
};

export const getSuppliersByProject = async (
  projectId: string
): Promise<Supplier[]> => {
  try {
    const q = query(
      collection(db, SUPPLIERS_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Supplier[];
  } catch (error) {
    console.error("Erro ao listar fornecedores por projeto:", error);
    throw error;
  }
};

export const updateSupplier = async (
  id: string,
  updates: Partial<Supplier>
): Promise<void> => {
  try {
    const docRef = doc(db, SUPPLIERS_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error);
    throw error;
  }
};

export const deleteSupplier = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, SUPPLIERS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar fornecedor:", error);
    throw error;
  }
};

// ===== CHECKLISTS DE QUALIDADE =====

export const createQualityChecklist = async (
  checklistData: Omit<QualityChecklist, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...checklistData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, QUALITY_CHECKLISTS_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar checklist de qualidade:", error);
    throw error;
  }
};

export const getQualityChecklistById = async (
  id: string
): Promise<QualityChecklist | null> => {
  try {
    const docRef = doc(db, QUALITY_CHECKLISTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as QualityChecklist;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar checklist de qualidade:", error);
    throw error;
  }
};

export const getAllQualityChecklists = async (): Promise<
  QualityChecklist[]
> => {
  try {
    const q = query(
      collection(db, QUALITY_CHECKLISTS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QualityChecklist[];
  } catch (error) {
    console.error("Erro ao listar checklists de qualidade:", error);
    throw error;
  }
};

export const getQualityChecklistsByProject = async (
  projectId: string
): Promise<QualityChecklist[]> => {
  try {
    const q = query(
      collection(db, QUALITY_CHECKLISTS_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QualityChecklist[];
  } catch (error) {
    console.error("Erro ao listar checklists por projeto:", error);
    throw error;
  }
};

export const updateQualityChecklist = async (
  id: string,
  updates: Partial<QualityChecklist>
): Promise<void> => {
  try {
    const docRef = doc(db, QUALITY_CHECKLISTS_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar checklist de qualidade:", error);
    throw error;
  }
};

export const deleteQualityChecklist = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, QUALITY_CHECKLISTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar checklist de qualidade:", error);
    throw error;
  }
};

// ===== EQUIPE (TEAM MEMBERS) =====

export const createTeamMember = async (
  memberData: Omit<TeamMember, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...memberData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, TEAM_MEMBERS_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar membro da equipe:", error);
    throw error;
  }
};

export const getAllTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const q = query(
      collection(db, TEAM_MEMBERS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TeamMember[];
  } catch (error) {
    console.error("Erro ao listar membros da equipe:", error);
    throw error;
  }
};

export const getTeamMembersByProject = async (
  projectId: string
): Promise<TeamMember[]> => {
  try {
    const q = query(
      collection(db, TEAM_MEMBERS_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as TeamMember[];
  } catch (error) {
    console.error("Erro ao listar membros da equipe por projeto:", error);
    throw error;
  }
};

export const updateTeamMember = async (
  id: string,
  updates: Partial<TeamMember>
): Promise<void> => {
  try {
    const docRef = doc(db, TEAM_MEMBERS_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar membro da equipe:", error);
    throw error;
  }
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, TEAM_MEMBERS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar membro da equipe:", error);
    throw error;
  }
};

// ===== EQUIPAMENTOS (EQUIPMENT) =====

export const createEquipment = async (
  equipmentData: Omit<Equipment, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...equipmentData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, EQUIPMENT_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar equipamento:", error);
    throw error;
  }
};

export const getAllEquipment = async (): Promise<Equipment[]> => {
  try {
    const q = query(
      collection(db, EQUIPMENT_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Equipment[];
  } catch (error) {
    console.error("Erro ao listar equipamentos:", error);
    throw error;
  }
};

export const getEquipmentByProject = async (
  projectId: string
): Promise<Equipment[]> => {
  try {
    const q = query(
      collection(db, EQUIPMENT_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Equipment[];
  } catch (error) {
    console.error("Erro ao listar equipamentos por projeto:", error);
    throw error;
  }
};

export const updateEquipment = async (
  id: string,
  updates: Partial<Equipment>
): Promise<void> => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar equipamento:", error);
    throw error;
  }
};

export const deleteEquipment = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar equipamento:", error);
    throw error;
  }
};

// ===== CRONOGRAMA (SCHEDULES) =====

export const createSchedule = async (
  scheduleData: Omit<Schedule, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...scheduleData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, SCHEDULES_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar tarefa no cronograma:", error);
    throw error;
  }
};

export const getAllSchedules = async (): Promise<Schedule[]> => {
  try {
    const q = query(
      collection(db, SCHEDULES_COLLECTION),
      orderBy("startDate", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Schedule[];
  } catch (error) {
    console.error("Erro ao listar tarefas do cronograma:", error);
    throw error;
  }
};

export const getSchedulesByProject = async (
  projectId: string
): Promise<Schedule[]> => {
  try {
    const q = query(
      collection(db, SCHEDULES_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("startDate", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Schedule[];
  } catch (error) {
    console.error("Erro ao listar tarefas por projeto:", error);
    throw error;
  }
};

export const updateSchedule = async (
  id: string,
  updates: Partial<Schedule>
): Promise<void> => {
  try {
    const docRef = doc(db, SCHEDULES_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar tarefa do cronograma:", error);
    throw error;
  }
};

export const deleteSchedule = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, SCHEDULES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar tarefa do cronograma:", error);
    throw error;
  }
};

// ===== SEGURANÇA (SAFETY RECORDS) =====

export const createSafetyRecord = async (
  recordData: Omit<SafetyRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...recordData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, SAFETY_RECORDS_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar registro de segurança:", error);
    throw error;
  }
};

export const getAllSafetyRecords = async (): Promise<SafetyRecord[]> => {
  try {
    const q = query(
      collection(db, SAFETY_RECORDS_COLLECTION),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SafetyRecord[];
  } catch (error) {
    console.error("Erro ao listar registros de segurança:", error);
    throw error;
  }
};

export const getSafetyRecordsByProject = async (
  projectId: string
): Promise<SafetyRecord[]> => {
  try {
    const q = query(
      collection(db, SAFETY_RECORDS_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SafetyRecord[];
  } catch (error) {
    console.error("Erro ao listar registros de segurança por projeto:", error);
    throw error;
  }
};

export const updateSafetyRecord = async (
  id: string,
  updates: Partial<SafetyRecord>
): Promise<void> => {
  try {
    const docRef = doc(db, SAFETY_RECORDS_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar registro de segurança:", error);
    throw error;
  }
};

export const deleteSafetyRecord = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, SAFETY_RECORDS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar registro de segurança:", error);
    throw error;
  }
};

// ===== MEDIÇÕES (MEASUREMENTS) =====

export const createMeasurement = async (
  measurementData: Omit<Measurement, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...measurementData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, MEASUREMENTS_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar medição:", error);
    throw error;
  }
};

export const getAllMeasurements = async (): Promise<Measurement[]> => {
  try {
    const q = query(
      collection(db, MEASUREMENTS_COLLECTION),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Measurement[];
  } catch (error) {
    console.error("Erro ao listar medições:", error);
    throw error;
  }
};

export const getMeasurementsByProject = async (
  projectId: string
): Promise<Measurement[]> => {
  try {
    const q = query(
      collection(db, MEASUREMENTS_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Measurement[];
  } catch (error) {
    console.error("Erro ao listar medições por projeto:", error);
    throw error;
  }
};

export const updateMeasurement = async (
  id: string,
  updates: Partial<Measurement>
): Promise<void> => {
  try {
    const docRef = doc(db, MEASUREMENTS_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar medição:", error);
    throw error;
  }
};

export const deleteMeasurement = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, MEASUREMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar medição:", error);
    throw error;
  }
};

// ===== PROBLEMAS (ISSUES) =====

export const createIssue = async (
  issueData: Omit<Issue, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...issueData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, ISSUES_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar problema:", error);
    throw error;
  }
};

export const getAllIssues = async (): Promise<Issue[]> => {
  try {
    const q = query(collection(db, ISSUES_COLLECTION), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Issue[];
  } catch (error) {
    console.error("Erro ao listar problemas:", error);
    throw error;
  }
};

export const getIssuesByProject = async (
  projectId: string
): Promise<Issue[]> => {
  try {
    const q = query(
      collection(db, ISSUES_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Issue[];
  } catch (error) {
    console.error("Erro ao listar problemas por projeto:", error);
    throw error;
  }
};

export const updateIssue = async (
  id: string,
  updates: Partial<Issue>
): Promise<void> => {
  try {
    const docRef = doc(db, ISSUES_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar problema:", error);
    throw error;
  }
};

export const deleteIssue = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, ISSUES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar problema:", error);
    throw error;
  }
};

// ===== DOCUMENTOS (DOCUMENTS) =====

export const createDocument = async (
  documentData: Omit<DocumentRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...documentData }).filter(
        ([, value]) => value !== undefined
      )
    );

    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), {
      ...cleanData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    throw error;
  }
};

export const getAllDocuments = async (): Promise<DocumentRecord[]> => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      orderBy("uploadDate", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DocumentRecord[];
  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    throw error;
  }
};

export const getDocumentsByProject = async (
  projectId: string
): Promise<DocumentRecord[]> => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("uploadDate", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DocumentRecord[];
  } catch (error) {
    console.error("Erro ao listar documentos por projeto:", error);
    throw error;
  }
};

export const updateDocument = async (
  id: string,
  updates: Partial<DocumentRecord>
): Promise<void> => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, id);
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates }).filter(([, value]) => value !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar documento:", error);
    throw error;
  }
};

export const deleteDocument = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    throw error;
  }
};

// ===== UTILITÁRIOS =====

/**
 * Recalcula o progresso da obra com base nas tarefas do cronograma (média do progresso das tarefas)
 * e persiste no projeto. Deve ser chamado após criar/atualizar/deletar tarefas do cronograma.
 */
export const updateProjectProgressFromSchedules = async (
  projectId: string
): Promise<void> => {
  try {
    const schedules = await getSchedulesByProject(projectId);
    const progress =
      schedules.length === 0
        ? 0
        : Math.round(
            schedules.reduce((sum, s) => sum + (s.progress ?? 0), 0) /
              schedules.length
          );
    await updateProject(projectId, { progress });
  } catch (error) {
    console.error("Erro ao atualizar progresso da obra a partir do cronograma:", error);
    throw error;
  }
};

export const getProjectStatistics = async (projectId: string) => {
  try {
    const project = await getProjectById(projectId);
    if (!project) return null;

    const diaryEntries = await getDiaryEntriesByProject(projectId);
    const budgets = await getBudgetsByProject(projectId);
    const qualityChecklists = await getQualityChecklistsByProject(projectId);

    const totalBudget = budgets.reduce(
      (sum, budget) => sum + budget.totalAmount,
      0
    );
    const totalSpent = budgets.reduce(
      (sum, budget) => sum + budget.spentAmount,
      0
    );

    return {
      project,
      diaryEntriesCount: diaryEntries.length,
      budgetsCount: budgets.length,
      qualityChecklistsCount: qualityChecklists.length,
      totalBudget,
      totalSpent,
      remainingBudget: totalBudget - totalSpent,
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas do projeto:", error);
    throw error;
  }
};

export const getInventoryStatistics = async () => {
  try {
    const allItems = await getAllInventoryItems();
    const lowStockItems = await getLowStockItems();

    const totalValue = allItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const categories = [...new Set(allItems.map((item) => item.category))];

    return {
      totalItems: allItems.length,
      lowStockItems: lowStockItems.length,
      totalValue,
      categoriesCount: categories.length,
      categories,
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas de inventário:", error);
    throw error;
  }
};
