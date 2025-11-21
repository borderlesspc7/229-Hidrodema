// Tipos locais para GerenciamentoObras
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

export type ViewMode =
  | "menu"
  | "new"
  | "history"
  | "edit"
  | "projects"
  | "inventory"
  | "budgets"
  | "suppliers"
  | "quality"
  | "reports"
  | "new-inventory"
  | "new-budget"
  | "new-supplier"
  | "new-quality"
  | "team"
  | "new-team"
  | "equipment"
  | "new-equipment"
  | "schedule"
  | "new-schedule"
  | "safety"
  | "new-safety"
  | "measurements"
  | "new-measurements"
  | "issues"
  | "new-issues"
  | "documents"
  | "new-documents";

