export interface DiaryEntry {
  id: string;
  projectId: string;
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
}

export interface Material {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  price?: number;
  supplier?: string;
  category?: string;
}

export interface Photo {
  id: string;
  name: string;
  description: string;
  dataUrl: string;
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

export interface Project {
  id: string;
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
}

export interface InventoryItem {
  id: string;
  projectId?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  alerts: string[];
}

export type InventoryMovementType = "entrada" | "saida" | "ajuste";

export interface InventoryMovement {
  id: string;
  projectId?: string;
  itemId: string;
  type: InventoryMovementType;
  quantityDelta: number; // positivo (entrada) | negativo (saida) | pode ser +/- (ajuste)
  unit: string;
  supplier?: string;
  category?: string;
  receivedAt: string; // yyyy-mm-dd
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  projectId: string;
  name: string;
  description: string;
  totalAmount: number;
  spentAmount: number;
  categories: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
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
  status: "pendente" | "aprovado" | "comprado" | "entregue";
}

export interface Supplier {
  id: string;
  projectId?: string;
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
}

export interface QualityChecklist {
  id: string;
  name: string;
  description: string;
  projectId: string;
  items: QualityItem[];
  status: "pendente" | "em-andamento" | "concluida";
  createdAt: string;
  updatedAt: string;
}

export interface QualityItem {
  id: string;
  description: string;
  status: "pendente" | "aprovado" | "reprovado";
  notes: string;
  responsible: string;
  checkedAt: string;
}

export type ObraReportType =
  | "rdo"
  | "expense"
  | "hydrostatic-test"
  | "project-completion";

export interface ObraReportBase {
  id: string;
  reportNumber?: string; // numeração sequencial (ex: RDO-20260416-00001)
  type: ObraReportType;
  projectId: string;
  date: string; // yyyy-mm-dd
  createdAt: string;
  updatedAt: string;
}

export interface RDOReport extends ObraReportBase {
  type: "rdo";
  activities: string;
  observations: string;
  photos: Photo[];
  team: string[];
  weather: string;
  responsible: string;
}

export interface ExpenseReport extends ObraReportBase {
  type: "expense";
  description: string;
  category: string;
  amount: number;
  notes: string;
}

export interface HydrostaticTestReport extends ObraReportBase {
  type: "hydrostatic-test";
  pressure: number;
  durationMinutes: number;
  result: "aprovado" | "reprovado";
  notes: string;
}

export interface ProjectCompletionReport extends ObraReportBase {
  type: "project-completion";
  finalStatus: "concluida" | "parcial" | "cancelada";
  summary: string;
  pendingItems: string;
}

export type ObraReport =
  | RDOReport
  | ExpenseReport
  | HydrostaticTestReport
  | ProjectCompletionReport;
