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
          diaryEntries.map((entry) => {
            const reportTypeInfo = getReportTypeInfo(entry.reportType);
            const ReportIcon = reportTypeInfo.icon;
            
            return (
              <div key={entry.id} className="obras-entry-item">
                <div className="obras-entry-info">
                  <div className="obras-entry-header-row">
                    <h3>{entry.obraName}</h3>
                    <span 
                      className="obras-report-type-badge"
                      style={{ 
                        backgroundColor: `${reportTypeInfo.color}15`,
                        color: reportTypeInfo.color,
                        borderColor: reportTypeInfo.color,
                      }}
                    >
                      <ReportIcon size={14} />
                      {reportTypeInfo.shortLabel}
                    </span>
                  </div>
                  <div className="obras-entry-meta">
                    <span className="obras-date">
                      <FiCalendar size={16} />
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    {entry.reportNumber && (
                      <span className="obras-report-number">
                        <FiFileText size={16} />
                        Nº {entry.reportNumber}
                      </span>
                    )}
                    <span className={`obras-status obras-status-${entry.status}`}>
                      {entry.status === "em-andamento" && (
                        <>
                          <FiClock size={16} />
                          Em Andamento
                        </>
                      )}
                      {entry.status === "concluida" && (
                        <>
                          <FiCheckCircle size={16} />
                          Concluída
                        </>
                      )}
                      {entry.status === "pausada" && (
                        <>
                          <FiClock size={16} />
                          Pausada
                        </>
                      )}
                    </span>
                    <span className="obras-materials-count">
                      <FiPackage size={16} />
                      {pluralize(entry.materials?.length || 0, "material", "materiais")}
                    </span>
                    <span className="obras-photos-count">
                      <FiCamera size={16} />
                      {pluralize(entry.photos?.length || 0, "foto", "fotos")}
                    </span>
                  </div>
                </div>
                <div className="obras-entry-actions">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(entry)}
                    className="obras-action-button"
                  >
                    <FiEdit3 size={16} />
                    Editar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => onExportPDF(entry)}
                    className="obras-action-button"
                  >
                    <FiFile size={16} />
                    PDF
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => entry.id && onDelete(entry.id)}
                    className="obras-action-button obras-delete"
                  >
                    <FiTrash2 size={16} />
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

