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

export interface DiaryEntry {
  id?: string;
  projectId?: string; // ID do projeto relacionado
  obraName: string;
  date: string;
  activities: string;
  materials: Material[];
  photos: Photo[];
  observations: string;
  weather: string;
  responsible: string;
  status: "em-andamento" | "concluida" | "pausada";
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

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

export interface Photo {
  id: string;
  name: string;
  description: string;
  dataUrl: string;
}

export interface InventoryItem {
  id?: string;
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

// ===== CONSTANTES DE COLLECTIONS =====

const PROJECTS_COLLECTION = "obrasProjects";
const DIARY_ENTRIES_COLLECTION = "obrasDiaryEntries";
const INVENTORY_COLLECTION = "obrasInventory";
const BUDGETS_COLLECTION = "obrasBudgets";
const SUPPLIERS_COLLECTION = "obrasSuppliers";
const QUALITY_CHECKLISTS_COLLECTION = "obrasQualityChecklists";

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
  itemData: Omit<InventoryItem, "id" | "lastUpdated" | "createdAt" | "updatedAt" | "alerts">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const cleanData = Object.fromEntries(
      Object.entries({ ...itemData }).filter(
        ([, value]) => value !== undefined
      )
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
    return allItems.filter(
      (item) => item.quantity <= item.minStock
    );
  } catch (error) {
    console.error("Erro ao buscar itens com estoque baixo:", error);
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

export const getSupplierById = async (
  id: string
): Promise<Supplier | null> => {
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

    const docRef = await addDoc(
      collection(db, QUALITY_CHECKLISTS_COLLECTION),
      {
        ...cleanData,
        createdAt: now,
        updatedAt: now,
      }
    );
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

// ===== UTILITÁRIOS =====

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

