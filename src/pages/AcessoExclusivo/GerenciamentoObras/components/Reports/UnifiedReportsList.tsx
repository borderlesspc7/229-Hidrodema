import { useState, useMemo } from "react";
import Button from "../../../../../components/ui/Button/Button";
import {
  FiArrowLeft,
  FiFileText,
  FiDollarSign,
  FiDroplet,
  FiFlag,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
import type { DiaryEntry, Project } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";

interface UnifiedReportsListProps {
  diaryEntries: DiaryEntry[];
  projects: Project[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
  onView: (entry: DiaryEntry) => void;
  onExportPdf: (entry: DiaryEntry) => void;
}

// Helper para obter informações do tipo de relatório
const getReportTypeInfo = (reportType?: string) => {
  switch (reportType) {
    case "rdo":
      return {
        label: "RDO - Relatório Diário de Obra",
        shortLabel: "RDO",
        icon: FiFileText,
        color: "#3b82f6",
      };
    case "lancamento-gastos":
      return {
        label: "Lançamento de Gastos",
        shortLabel: "Gastos",
        icon: FiDollarSign,
        color: "#10b981",
      };
    case "teste-hidrostatico":
      return {
        label: "RTH - Relatório de Teste Hidrostático",
        shortLabel: "Teste Hidrostático",
        icon: FiDroplet,
        color: "#06b6d4",
      };
    case "conclusao-obra":
      return {
        label: "RCO - Relatório de Conclusão de Obra",
        shortLabel: "Conclusão",
        icon: FiFlag,
        color: "#8b5cf6",
      };
    default:
      return {
        label: "Registro de Obra",
        shortLabel: "Registro",
        icon: FiFileText,
        color: "#64748b",
      };
  }
};

export default function UnifiedReportsList({
  diaryEntries,
  projects,
  onViewChange,
  onEdit,
  onDelete,
  onView,
  onExportPdf,
}: UnifiedReportsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "type" | "project">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filtrar e ordenar relatórios
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...diaryEntries];

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.obraName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.reportNumber &&
            entry.reportNumber.toString().includes(searchTerm)),
      );
    }

    // Filtro por tipo
    if (filterType !== "all") {
      filtered = filtered.filter((entry) => entry.reportType === filterType);
    }

    // Filtro por projeto
    if (filterProject !== "all") {
      filtered = filtered.filter((entry) => entry.projectId === filterProject);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "type":
          comparison = (a.reportType || "").localeCompare(b.reportType || "");
          break;
        case "project":
          comparison = a.obraName.localeCompare(b.obraName);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [diaryEntries, searchTerm, filterType, filterProject, sortBy, sortOrder]);

  // Estatísticas
  const stats = useMemo(() => {
    const byType = {
      rdo: diaryEntries.filter((e) => e.reportType === "rdo").length,
      gastos: diaryEntries.filter((e) => e.reportType === "lancamento-gastos")
        .length,
      hidrostatico: diaryEntries.filter(
        (e) => e.reportType === "teste-hidrostatico",
      ).length,
      conclusao: diaryEntries.filter((e) => e.reportType === "conclusao-obra")
        .length,
    };

    return {
      total: diaryEntries.length,
      byType,
    };
  }, [diaryEntries]);

  return (
    <section
      className="obras-unified-reports-container"
      aria-labelledby="obras-unified-reports-title"
    >
      <header className="obras-unified-reports-header">
        <div className="obras-unified-reports-title">
          <h2 id="obras-unified-reports-title">RELATÓRIOS UNIFICADOS</h2>
          <p>Todos os relatórios criados em um único lugar</p>
        </div>
        <div className="obras-unified-reports-header-actions">
          <Button variant="primary" onClick={() => onViewChange("new")}>
            <FiFileText size={16} />
            Novo Relatório
          </Button>
          <Button
            variant="secondary"
            onClick={() => onViewChange("menu")}
            className="obras-back-btn"
          >
            <FiArrowLeft size={16} />
            Voltar ao Menu
          </Button>
        </div>
      </header>

      <div className="obras-unified-stats" role="group" aria-label="Resumo de relatórios">
        <div className="obras-unified-stat-card">
          <div className="obras-unified-stat-value">{stats.total}</div>
          <div className="obras-unified-stat-label">Total de Relatórios</div>
        </div>
        <div
          className="obras-unified-stat-card"
          style={{ borderColor: "#3b82f6" }}
        >
          <div
            className="obras-unified-stat-value"
            style={{ color: "#3b82f6" }}
          >
            {stats.byType.rdo}
          </div>
          <div className="obras-unified-stat-label">RDOs</div>
        </div>
        <div
          className="obras-unified-stat-card"
          style={{ borderColor: "#10b981" }}
        >
          <div
            className="obras-unified-stat-value"
            style={{ color: "#10b981" }}
          >
            {stats.byType.gastos}
          </div>
          <div className="obras-unified-stat-label">Gastos</div>
        </div>
        <div
          className="obras-unified-stat-card"
          style={{ borderColor: "#06b6d4" }}
        >
          <div
            className="obras-unified-stat-value"
            style={{ color: "#06b6d4" }}
          >
            {stats.byType.hidrostatico}
          </div>
          <div className="obras-unified-stat-label">Testes Hidrostáticos</div>
        </div>
        <div
          className="obras-unified-stat-card"
          style={{ borderColor: "#8b5cf6" }}
        >
          <div
            className="obras-unified-stat-value"
            style={{ color: "#8b5cf6" }}
          >
            {stats.byType.conclusao}
          </div>
          <div className="obras-unified-stat-label">Conclusões</div>
        </div>
      </div>

      <div className="obras-unified-filters" role="search" aria-label="Filtros e busca de relatórios">
        <div className="obras-unified-search">
          <FiSearch size={18} aria-hidden />
          <input
            type="search"
            placeholder="Buscar por nome da obra ou número do relatório..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar por nome da obra ou número do relatório"
          />
        </div>

        <div className="obras-unified-filter-group">
          <label htmlFor="obras-filter-type">
            <FiFilter size={16} aria-hidden />
            Tipo:
          </label>
          <select
            id="obras-filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filtrar por tipo de relatório"
          >
            <option value="all">Todos os tipos</option>
            <option value="rdo">RDO</option>
            <option value="lancamento-gastos">Lançamento de Gastos</option>
            <option value="teste-hidrostatico">Teste Hidrostático</option>
            <option value="conclusao-obra">Conclusão de Obra</option>
          </select>
        </div>

        <div className="obras-unified-filter-group">
          <label htmlFor="obras-filter-project">Obra:</label>
          <select
            id="obras-filter-project"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            aria-label="Filtrar por obra"
          >
            <option value="all">Todas as obras</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="obras-unified-filter-group">
          <label htmlFor="obras-sort-by">Ordenar por:</label>
          <select
            id="obras-sort-by"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "date" | "type" | "project")
            }
            aria-label="Ordenar relatórios por"
          >
            <option value="date">Data</option>
            <option value="type">Tipo</option>
            <option value="project">Obra</option>
          </select>
        </div>

        <button
          type="button"
          className="obras-unified-sort-toggle"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          title={sortOrder === "asc" ? "Ordem crescente (clique para decrescente)" : "Ordem decrescente (clique para crescente)"}
          aria-label={sortOrder === "asc" ? "Ordem crescente; alterar para decrescente" : "Ordem decrescente; alterar para crescente"}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <div className="obras-unified-reports-list">
        {filteredAndSortedReports.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiFileText size={64} />
            </div>
            <h3>Nenhum relatório encontrado</h3>
            <p>
              {searchTerm || filterType !== "all" || filterProject !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Crie seu primeiro relatório"}
            </p>
            <Button variant="primary" onClick={() => onViewChange("new")}>
              Novo Relatório
            </Button>
          </div>
        ) : (
          filteredAndSortedReports.map((entry) => {
            const reportTypeInfo = getReportTypeInfo(entry.reportType);
            const ReportIcon = reportTypeInfo.icon;

            return (
              <article key={entry.id} className="obras-unified-report-card">
                <div className="obras-unified-report-main">
                  <div
                    className="obras-unified-report-icon"
                    style={{ backgroundColor: `${reportTypeInfo.color}15` }}
                  >
                    <ReportIcon
                      size={24}
                      style={{ color: reportTypeInfo.color }}
                    />
                  </div>

                  <div className="obras-unified-report-info">
                    <div className="obras-unified-report-header">
                      <h3>{entry.obraName}</h3>
                      <span
                        className="obras-unified-report-type-badge"
                        style={{
                          backgroundColor: `${reportTypeInfo.color}15`,
                          color: reportTypeInfo.color,
                          borderColor: reportTypeInfo.color,
                        }}
                      >
                        {reportTypeInfo.shortLabel}
                      </span>
                    </div>

                    <div className="obras-unified-report-meta">
                      <span className="obras-unified-report-date">
                        <FiCalendar size={14} />
                        {new Date(entry.date).toLocaleDateString("pt-BR")}
                      </span>

                      {entry.reportNumber && (
                        <span className="obras-unified-report-number">
                          Nº {entry.reportNumber}
                        </span>
                      )}

                      {entry.approvalStatus && (
                        <span
                          className={`obras-unified-approval-status obras-status-${entry.approvalStatus}`}
                        >
                          {entry.approvalStatus === "preenchendo" &&
                            "Preenchendo"}
                          {entry.approvalStatus === "revisao" && "Em Revisão"}
                          {entry.approvalStatus === "aprovado" && "Aprovado"}
                        </span>
                      )}
                    </div>

                    {entry.dayOfWeek && (
                      <span className="obras-unified-report-weekday">
                        {entry.dayOfWeek}
                      </span>
                    )}
                  </div>
                </div>

                <div className="obras-unified-report-actions">
                  <Button
                    variant="secondary"
                    onClick={() => onView(entry)}
                    className="obras-action-btn"
                  >
                    <FiEye size={16} />
                    Visualizar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(entry)}
                    className="obras-action-btn"
                  >
                    <FiEdit3 size={16} />
                    Editar
                  </Button>
                  <Button
                    variant="secondary"
                    className="obras-action-btn"
                    onClick={() => onExportPdf(entry)}
                  >
                    Pdf
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => entry.id && onDelete(entry.id)}
                    className="obras-action-btn obras-delete-btn"
                  >
                    <FiTrash2 size={16} />
                    Excluir
                  </Button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {filteredAndSortedReports.length > 0 && (
        <p className="obras-unified-results-info" aria-live="polite">
          Mostrando {filteredAndSortedReports.length} de {diaryEntries.length}{" "}
          {filteredAndSortedReports.length === 1 ? "relatório" : "relatórios"}
        </p>
      )}
    </section>
  );
}
