import Button from "../../../../../components/ui/Button/Button";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiPackage,
  FiCamera,
  FiEdit3,
  FiFile,
  FiTrash2,
  FiFileText,
  FiClipboard,
  FiDollarSign,
  FiDroplet,
  FiFlag,
} from "react-icons/fi";
import type { DiaryEntry } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";
import { pluralize } from "../../../../../utils/pluralize";

// Helper para obter informações do tipo de relatório
const getReportTypeInfo = (reportType?: string) => {
  switch (reportType) {
    case "rdo":
      return {
        label: "RDO - Relatório Diário de Obra",
        shortLabel: "RDO",
        icon: FiClipboard,
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

interface DiarioObrasHistoryProps {
  diaryEntries: DiaryEntry[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
  onExportPDF: (entry: DiaryEntry) => void;
}

export default function DiarioObrasHistory({
  diaryEntries,
  onViewChange,
  onEdit,
  onDelete,
  onExportPDF,
}: DiarioObrasHistoryProps) {
  return (
    <div className="obras-history-container">
      <div className="obras-history-header">
        <h2>Histórico de Registros</h2>
        <Button
          variant="secondary"
          onClick={() => onViewChange("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-entries-list">
        {diaryEntries.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiFileText size={64} />
            </div>
            <h3>Nenhum registro encontrado</h3>
            <p>Crie seu primeiro registro diário de obra</p>
            <Button variant="primary" onClick={() => onViewChange("new")}>
              Novo Registro
            </Button>
          </div>
        ) : (
          diaryEntries.map((entry, index) => {
            const reportTypeInfo = getReportTypeInfo(entry.reportType);
            const ReportIcon = reportTypeInfo.icon;
            const dateFormatted = new Date(entry.date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            return (
              <article
                key={entry.id ?? `entry-${index}`}
                className="obras-entry-item"
                aria-labelledby={`entry-title-${entry.id ?? index}`}
              >
                <div className="obras-entry-info">
                  <div className="obras-entry-header-row">
                    <h3 id={`entry-title-${entry.id ?? index}`}>{entry.obraName}</h3>
                    <span
                      className="obras-report-type-badge"
                      style={{
                        backgroundColor: `${reportTypeInfo.color}18`,
                        color: reportTypeInfo.color,
                        borderColor: reportTypeInfo.color,
                      }}
                      aria-label={`Tipo: ${reportTypeInfo.shortLabel}`}
                    >
                      <ReportIcon size={14} aria-hidden />
                      {reportTypeInfo.shortLabel}
                    </span>
                  </div>
                  <div className="obras-entry-meta" role="list">
                    <span className="obras-date" role="listitem">
                      <FiCalendar size={16} aria-hidden />
                      {dateFormatted}
                    </span>
                    {entry.reportNumber != null && entry.reportNumber !== "" && (
                      <span className="obras-report-number" role="listitem">
                        <FiFileText size={16} aria-hidden />
                        Nº {entry.reportNumber}
                      </span>
                    )}
                    <span
                      className={`obras-status obras-status-${entry.status ?? "em-andamento"}`}
                      role="listitem"
                    >
                      {(entry.status === "em-andamento" || !entry.status) && (
                        <>
                          <FiClock size={16} aria-hidden />
                          Em Andamento
                        </>
                      )}
                      {entry.status === "concluida" && (
                        <>
                          <FiCheckCircle size={16} aria-hidden />
                          Concluída
                        </>
                      )}
                      {entry.status === "pausada" && (
                        <>
                          <FiClock size={16} aria-hidden />
                          Pausada
                        </>
                      )}
                    </span>
                    <span className="obras-materials-count" role="listitem">
                      <FiPackage size={16} aria-hidden />
                      {pluralize(entry.materials?.length ?? 0, "material", "materiais")}
                    </span>
                    <span className="obras-photos-count" role="listitem">
                      <FiCamera size={16} aria-hidden />
                      {pluralize(entry.photos?.length ?? 0, "foto", "fotos")}
                    </span>
                  </div>
                </div>
                <div className="obras-entry-actions" role="group" aria-label="Ações do registro">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(entry)}
                    className="obras-action-button"
                    title="Editar registro"
                  >
                    <FiEdit3 size={16} aria-hidden />
                    Editar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => onExportPDF(entry)}
                    className="obras-action-button"
                    title="Exportar PDF"
                  >
                    <FiFile size={16} aria-hidden />
                    PDF
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => entry.id && onDelete(entry.id)}
                    className="obras-action-button obras-delete"
                    title="Excluir registro"
                  >
                    <FiTrash2 size={16} aria-hidden />
                    Excluir
                  </Button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

