export type GerenciamentoObrasViewMode =
  | "menu"
  | "new"
  | "history"
  | "edit"
  | "projects"
  | "project-overview"
  | "inventory"
  | "budgets"
  | "suppliers"
  | "quality"
  | "reports"
  | "reports-unified"
  | "report-viewer"
  | "reports-select"
  | "reports-rdo-new"
  | "reports-rdo-edit"
  | "reports-expense-new"
  | "reports-expense-edit"
  | "reports-hydrostatic-new"
  | "reports-hydrostatic-edit"
  | "reports-completion-new"
  | "reports-completion-edit"
  | "new-inventory"
  | "inventory-entry"
  | "inventory-movements"
  | "new-budget"
  | "new-supplier"
  | "new-quality";

export type ViewChangeContext = {
  projectId?: string;
};
