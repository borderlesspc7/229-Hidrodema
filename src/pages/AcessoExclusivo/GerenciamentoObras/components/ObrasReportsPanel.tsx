import { useMemo, useState } from "react";
import Button from "../../../../components/ui/Button/Button";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import type {
  DiaryEntry,
  InventoryItem,
  ObraReport,
  Project,
  Supplier,
} from "../../../../types/obrasGerenciamentoModule";
import ReportTypeBadge from "./ReportTypeBadge";
import {
  FiArrowLeft,
  FiFileText,
  FiTrendingUp,
  FiPackage,
  FiAlertTriangle,
  FiDollarSign,
  FiTruck,
  FiDownload,
  FiRefreshCw,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";

type InventoryReport = {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  categories: number;
  alerts: unknown[];
};

type Props = {
  projects: Project[];
  diaryEntries: DiaryEntry[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  reports: ObraReport[];
  onDeleteReport: (id: string) => void | Promise<void>;
  onEditReport: (report: ObraReport) => void;
  projectCount: number;
  inventoryReport: InventoryReport;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function ObrasReportsPanel({
  projects,
  diaryEntries,
  inventory,
  suppliers,
  reports,
  onDeleteReport,
  onEditReport,
  projectCount,
  inventoryReport,
  setViewMode,
}: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const scopedDiaries = useMemo(() => {
    if (!selectedProjectId) return diaryEntries;
    return diaryEntries.filter((d) => d.projectId === selectedProjectId);
  }, [diaryEntries, selectedProjectId]);

  const scopedInventory = useMemo(() => {
    if (!selectedProjectId) return inventory;
    return inventory.filter((i) => i.projectId === selectedProjectId);
  }, [inventory, selectedProjectId]);

  const scopedSuppliers = useMemo(() => {
    if (!selectedProjectId) return suppliers;
    return suppliers.filter((s) => s.projectId === selectedProjectId);
  }, [suppliers, selectedProjectId]);

  const scopedReports = useMemo(() => {
    const list = !selectedProjectId
      ? reports
      : reports.filter((r) => r.projectId === selectedProjectId);
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reports, selectedProjectId]);

  const scopedInventoryReport = useMemo(() => {
    if (!selectedProjectId) return inventoryReport;
    const lowStock = scopedInventory.filter((i) => i.quantity <= i.minStock);
    const totalValue = scopedInventory.reduce(
      (acc, i) => acc + i.quantity * i.price,
      0
    );
    const categories = [...new Set(scopedInventory.map((i) => i.category))];
    return {
      totalItems: scopedInventory.length,
      lowStockItems: lowStock.length,
      totalValue,
      categories: categories.length,
      alerts: lowStock,
    } satisfies InventoryReport;
  }, [inventoryReport, scopedInventory, selectedProjectId]);

  const scopedProjectCount = useMemo(() => {
    if (!selectedProjectId) return projectCount;
    return selectedProject ? 1 : 0;
  }, [projectCount, selectedProject, selectedProjectId]);

  return (
    <div className="obras-reports-container">
      <div className="obras-reports-header">
        <h2>Relatórios e Análises</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-reports-dashboard">
        <div className="obras-form-row">
          <div className="obras-form-field obras-field-full">
            <label>Filtrar por Obra</label>
            <select
              className="obras-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">Todas as obras</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {selectedProject ? (
              <span className="obras-helper-text">
                Exibindo dados vinculados à obra: <strong>{selectedProject.name}</strong>
              </span>
            ) : (
              <span className="obras-helper-text">
                Exibindo dados de todas as obras.
              </span>
            )}
          </div>
        </div>

        <div className="obras-dashboard-cards">
          <div className="obras-dashboard-card">
            <div className="obras-card-icon">
              <FiFileText size={32} />
            </div>
            <div className="obras-card-content">
              <h3>Registros Diários</h3>
              <p className="obras-card-number">{scopedDiaries.length}</p>
              <p className="obras-card-label">
                Total de registros{selectedProject ? " na obra" : ""}
              </p>
            </div>
          </div>

          <div className="obras-dashboard-card">
            <div className="obras-card-icon">
              <FiTrendingUp size={32} />
            </div>
            <div className="obras-card-content">
              <h3>Projetos Ativos</h3>
              <p className="obras-card-number">{scopedProjectCount}</p>
              <p className="obras-card-label">
                {selectedProject ? "Obra selecionada" : "Projetos em andamento"}
              </p>
            </div>
          </div>

          <div className="obras-dashboard-card">
            <div className="obras-card-icon">
              <FiPackage size={32} />
            </div>
            <div className="obras-card-content">
              <h3>Itens em Estoque</h3>
              <p className="obras-card-number">{scopedInventoryReport.totalItems}</p>
              <p className="obras-card-label">Total de itens</p>
            </div>
          </div>

          <div className="obras-dashboard-card">
            <div className="obras-card-icon">
              <FiAlertTriangle size={32} />
            </div>
            <div className="obras-card-content">
              <h3>Alertas de Estoque</h3>
              <p className="obras-card-number">
                {scopedInventoryReport.lowStockItems}
              </p>
              <p className="obras-card-label">Itens com estoque baixo</p>
            </div>
          </div>

          <div className="obras-dashboard-card">
            <div className="obras-card-icon">
              <FiDollarSign size={32} />
            </div>
            <div className="obras-card-content">
              <h3>Valor do Estoque</h3>
              <p className="obras-card-number">
                R$ {scopedInventoryReport.totalValue.toLocaleString()}
              </p>
              <p className="obras-card-label">Valor total</p>
            </div>
          </div>

          <div className="obras-dashboard-card">
            <div className="obras-card-icon">
              <FiTruck size={32} />
            </div>
            <div className="obras-card-content">
              <h3>Fornecedores</h3>
              <p className="obras-card-number">{scopedSuppliers.length}</p>
              <p className="obras-card-label">Fornecedores cadastrados</p>
            </div>
          </div>
        </div>

        <div className="obras-reports-actions">
          <Button variant="primary" onClick={() => setViewMode("reports-select")}>
            <FiDownload size={20} />
            Gerar Relatório
          </Button>
          <Button variant="secondary" onClick={() => setViewMode("reports-unified")}>
            <FiFileText size={20} />
            Lista Unificada
          </Button>
          <Button variant="secondary">
            <FiRefreshCw size={20} />
            Atualizar Dados
          </Button>
        </div>

        <div className="obras-section" style={{ marginTop: 24 }}>
          <h3 className="obras-section-title">
            <FiFileText /> Histórico de Relatórios
          </h3>
          {scopedReports.length === 0 ? (
            <div className="obras-empty-state">
              <h3>Nenhum relatório gerado</h3>
              <p>Gere um relatório para criar histórico por obra.</p>
            </div>
          ) : (
            <div className="obras-materials-list">
              <table className="obras-materials-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Obra</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {scopedReports.slice(0, 50).map((r) => {
                    const project = projects.find((p) => p.id === r.projectId);
                    const date =
                      "date" in r && typeof r.date === "string" ? r.date : "";
                    return (
                      <tr key={r.id}>
                        <td>
                          <ReportTypeBadge type={r.type} />
                        </td>
                        <td>{date ? new Date(date).toLocaleDateString() : "-"}</td>
                        <td>{project?.name ?? "-"}</td>
                        <td>{new Date(r.createdAt).toLocaleString()}</td>
                        <td>
                          <Button
                            variant="secondary"
                            onClick={() => onEditReport(r)}
                            className="obras-remove-btn"
                          >
                            <FiEdit3 size={14} />
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => void onDeleteReport(r.id)}
                            className="obras-remove-btn"
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
