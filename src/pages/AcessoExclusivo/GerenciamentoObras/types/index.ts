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

/** Opcional: ao abrir formulário de recurso (estoque, fornecedor, equipe, equipamento) com obra filtrada, pré-seleciona a obra. */
export interface ViewChangeContext {
  projectId?: string;
}

export type ViewMode =
  | "menu"
  | "new"
  | "select-report-type"
  | "new-rdo"
  | "new-expense"
  | "new-hydrostatic"
  | "new-conclusion"
  | "history"
  | "edit"
  | "projects"
  | "project-detail"
  | "inventory"
  | "budgets"
  | "suppliers"
  | "quality"
  | "reports"
  | "unified-reports"
  | "view-report"
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
