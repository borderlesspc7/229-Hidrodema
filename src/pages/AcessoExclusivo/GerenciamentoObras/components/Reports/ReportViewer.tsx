import Button from "../../../../../components/ui/Button/Button";
import {
  FiArrowLeft,
  FiEdit3,
  FiTrash2,
  FiFileText,
  FiCalendar,
  FiClock,
  FiUsers,
  FiTool,
  FiActivity,
  FiAlertTriangle,
  FiMessageSquare,
  FiCamera,
  FiVideo,
  FiCheck,
  FiDollarSign,
  FiDroplet,
} from "react-icons/fi";
import type { DiaryEntry } from "../../../../../services/obrasService";
import { pluralize } from "../../../../../utils/pluralize";

interface ReportViewerProps {
  entry: DiaryEntry;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Helper para obter informações do tipo de relatório
const getReportTypeInfo = (reportType?: string) => {
  switch (reportType) {
    case "rdo":
      return {
        label: "RDO - Relatório Diário de Obra",
        icon: FiFileText,
        color: "#3b82f6",
      };
    case "lancamento-gastos":
      return {
        label: "Lançamento de Gastos",
        icon: FiDollarSign,
        color: "#10b981",
      };
    case "teste-hidrostatico":
      return {
        label: "RTH - Relatório de Teste Hidrostático",
        icon: FiDroplet,
        color: "#06b6d4",
      };
    case "conclusao-obra":
      return {
        label: "RCO - Relatório de Conclusão de Obra",
        icon: FiFileText,
        color: "#8b5cf6",
      };
    default:
      return {
        label: "Registro de Obra",
        icon: FiFileText,
        color: "#64748b",
      };
  }
};

export default function ReportViewer({ entry, onBack, onEdit, onDelete }: ReportViewerProps) {
  const reportTypeInfo = getReportTypeInfo(entry.reportType);
  const ReportIcon = reportTypeInfo.icon;

  return (
    <div className="obras-report-viewer-container">
      {/* Header */}
      <div className="obras-report-viewer-header">
        <Button variant="secondary" onClick={onBack} className="obras-back-btn">
          <FiArrowLeft size={16} />
          Voltar
        </Button>

        <div className="obras-report-viewer-actions">
          <Button variant="secondary" onClick={onEdit}>
            <FiEdit3 size={16} />
            Editar
          </Button>
          <Button variant="secondary" onClick={onDelete} className="obras-delete-btn">
            <FiTrash2 size={16} />
            Excluir
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="obras-report-viewer-content">
        {/* Title Section */}
        <div className="obras-report-viewer-title-section">
          <div className="obras-report-viewer-icon" style={{ backgroundColor: `${reportTypeInfo.color}15` }}>
            <ReportIcon size={48} style={{ color: reportTypeInfo.color }} />
          </div>
          <div>
            <h1 style={{ color: reportTypeInfo.color }}>{reportTypeInfo.label}</h1>
            <h2>{entry.obraName}</h2>
          </div>
        </div>

        {/* Basic Info */}
        <div className="obras-report-viewer-section">
          <h3>Informações Básicas</h3>
          <div className="obras-report-viewer-grid">
            <div className="obras-report-viewer-field">
              <label>Número do Relatório</label>
              <span>{entry.reportNumber != null ? String(entry.reportNumber) : "—"}</span>
            </div>
            <div className="obras-report-viewer-field">
              <label>Data</label>
              <span>
                <FiCalendar size={16} aria-hidden />
                {entry.date
                  ? new Date(entry.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
            {(entry.dayOfWeek != null && entry.dayOfWeek !== "") && (
              <div className="obras-report-viewer-field">
                <label>Dia da Semana</label>
                <span>{entry.dayOfWeek}</span>
              </div>
            )}
            {(entry.approvalStatus != null && entry.approvalStatus !== "") && (
              <div className="obras-report-viewer-field">
                <label>Status de Aprovação</label>
                <span className={`obras-status-badge obras-status-${entry.approvalStatus}`}>
                  {entry.approvalStatus === "preenchendo" && "Preenchendo"}
                  {entry.approvalStatus === "revisao" && "Em Revisão"}
                  {entry.approvalStatus === "aprovado" && "Aprovado"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RDO Specific Content */}
        {entry.reportType === "rdo" && (
          <>
            {/* Work Schedule */}
            {entry.workSchedule && (
              <div className="obras-report-viewer-section">
                <h3>
                  <FiClock size={20} /> Horário de Trabalho
                </h3>
                <div className="obras-report-viewer-grid">
                  <div className="obras-report-viewer-field">
                    <label>Entrada</label>
                    <span>{entry.workSchedule.entryTime}</span>
                  </div>
                  <div className="obras-report-viewer-field">
                    <label>Saída</label>
                    <span>{entry.workSchedule.exitTime}</span>
                  </div>
                  <div className="obras-report-viewer-field">
                    <label>Intervalo</label>
                    <span>
                      {entry.workSchedule.breakStart} - {entry.workSchedule.breakEnd}
                    </span>
                  </div>
                  <div className="obras-report-viewer-field">
                    <label>Total de Horas</label>
                    <span className="obras-highlight">{entry.workSchedule.totalHours}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Workforce */}
            {entry.workforce && entry.workforce.length > 0 && (
              <div className="obras-report-viewer-section">
                <h3>
                  <FiUsers size={20} /> {pluralize(entry.workforce.length, "Mão de Obra", "Mãos de Obra")}
                </h3>
                <div className="obras-report-viewer-list">
                  {entry.workforce.map((worker) => (
                    <div key={worker.id} className="obras-report-viewer-list-item">
                      <strong>{worker.name}</strong>
                      <span>{worker.company}</span>
                      <span className="obras-badge">Qtd: {worker.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {entry.equipmentUsed && entry.equipmentUsed.length > 0 && (
              <div className="obras-report-viewer-section">
                <h3>
                  <FiTool size={20} /> {pluralize(entry.equipmentUsed.length, "Equipamento", "Equipamentos")}
                </h3>
                <div className="obras-report-viewer-list">
                  {entry.equipmentUsed.map((eq) => (
                    <div key={eq.id} className="obras-report-viewer-list-item">
                      <strong>{eq.name}</strong>
                      <span>Código: {eq.code}</span>
                      <span className="obras-badge">Qtd: {eq.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities */}
            {entry.activitiesList && entry.activitiesList.length > 0 && (
              <div className="obras-report-viewer-section">
                <h3>
                  <FiActivity size={20} /> {pluralize(entry.activitiesList.length, "Atividade", "Atividades")}
                </h3>
                <div className="obras-report-viewer-list">
                  {entry.activitiesList.map((activity) => (
                    <div key={activity.id} className="obras-report-viewer-activity">
                      <div className="obras-report-viewer-activity-header">
                        <strong>{activity.description}</strong>
                        <span className={`obras-status-badge obras-status-${activity.status}`}>
                          {activity.progress}% - {activity.status}
                        </span>
                      </div>
                      {activity.details && <p>{activity.details}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Expense Specific Content */}
        {entry.reportType === "lancamento-gastos" && entry.comments && entry.comments.length > 0 && (
          <div className="obras-report-viewer-section">
            <h3>
              <FiDollarSign size={20} /> {pluralize(entry.comments.length, "Gasto Registrado", "Gastos Registrados")}
            </h3>
            <div className="obras-report-viewer-list">
              {entry.comments.map((comment) => (
                <div key={comment.id} className="obras-report-viewer-expense">
                  <div className="obras-report-viewer-expense-header">
                    <strong>{comment.author}</strong>
                    <span>{new Date(comment.date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hydrostatic Test Specific Content */}
        {entry.reportType === "teste-hidrostatico" && entry.testItems && entry.testItems.length > 0 && (
          <div className="obras-report-viewer-section">
            <h3>
              <FiDroplet size={20} /> {pluralize(entry.testItems.length, "Item Testado", "Itens Testados")}
            </h3>
            <div className="obras-report-viewer-list">
              {entry.testItems.map((item, index) => (
                <div key={index} className="obras-report-viewer-test-item">
                  <strong>{item.itemName}</strong>
                  <span className={`obras-status-badge ${item.result === "aprovado" ? "obras-status-aprovado" : "obras-status-reprovado"}`}>
                    {item.result}
                  </span>
                  {item.notes && <p>{item.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Conclusion Specific Content */}
        {entry.reportType === "conclusao-obra" && (
          <>
            {entry.conclusionActivities && entry.conclusionActivities.length > 0 && (
              <div className="obras-report-viewer-section">
                <h3>
                  <FiActivity size={20} /> {pluralize(entry.conclusionActivities.length, "Atividade de Conclusão", "Atividades de Conclusão")}
                </h3>
                <div className="obras-report-viewer-list">
                  {entry.conclusionActivities.map((activity) => (
                    <div key={activity.id} className="obras-report-viewer-activity">
                      <div className="obras-report-viewer-activity-header">
                        <strong>{activity.description}</strong>
                        <span className={`obras-status-badge obras-status-${activity.status}`}>
                          {activity.progress}% - {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entry.conclusionOccurrences && entry.conclusionOccurrences.length > 0 && (
              <div className="obras-report-viewer-section">
                <h3>
                  <FiAlertTriangle size={20} /> {pluralize(entry.conclusionOccurrences.length, "Ocorrência", "Ocorrências")}
                </h3>
                <div className="obras-report-viewer-list">
                  {entry.conclusionOccurrences.map((occurrence) => (
                    <div key={occurrence.id} className="obras-report-viewer-occurrence">
                      <strong>{occurrence.description}</strong>
                      {occurrence.tags && occurrence.tags.length > 0 && (
                        <div className="obras-tags">
                          {occurrence.tags.map((tag, i) => (
                            <span key={i} className="obras-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Comments (for all types except expenses which uses comments for data) */}
        {entry.comments && entry.comments.length > 0 && entry.reportType !== "lancamento-gastos" && (
          <div className="obras-report-viewer-section">
            <h3>
              <FiMessageSquare size={20} /> {pluralize(entry.comments.length, "Comentário", "Comentários")}
            </h3>
            <div className="obras-report-viewer-list">
              {entry.comments.map((comment) => (
                <div key={comment.id} className="obras-report-viewer-comment">
                  <div className="obras-report-viewer-comment-header">
                    <strong>{comment.author}</strong>
                    <span>{new Date(comment.date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments (PDF/arquivos) */}
        {entry.attachments && entry.attachments.length > 0 && (
          <div className="obras-report-viewer-section">
            <h3>
              <FiFileText size={20} /> Anexos ({entry.attachments.length})
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {entry.attachments.map((a) => (
                <li key={a.id} style={{ marginBottom: "8px" }}>
                  <a href={a.fileUrl} target="_blank" rel="noopener noreferrer">
                    {a.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Photos */}
        {entry.photos && entry.photos.length > 0 && (
          <div className="obras-report-viewer-section">
            <h3>
              <FiCamera size={20} /> {pluralize(entry.photos.length, "Foto", "Fotos")}
            </h3>
            <div className="obras-report-viewer-photos">
              {entry.photos.map((photo) => (
                <div key={photo.id} className="obras-report-viewer-photo">
                  <img src={photo.dataUrl} alt={photo.name} />
                  {photo.description && <p>{photo.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {entry.videos && entry.videos.length > 0 && (
          <div className="obras-report-viewer-section">
            <h3>
              <FiVideo size={20} /> {pluralize(entry.videos.length, "Vídeo", "Vídeos")}
            </h3>
            <div className="obras-report-viewer-videos">
              {entry.videos.map((video) => (
                <div key={video.id} className="obras-report-viewer-video">
                  <video src={video.dataUrl} controls />
                  {video.description && <p>{video.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature/Approval */}
        {entry.signature && (
          <div className="obras-report-viewer-section">
            <h3>
              <FiCheck size={20} /> Assinatura
            </h3>
            <div className="obras-report-viewer-signature">
              <img src={entry.signature} alt="Assinatura" />
              {entry.signedBy && (
                <div className="obras-report-viewer-signature-info">
                  <p>Assinado por: {entry.signedBy}</p>
                  {entry.signedAt && <p>Em: {new Date(entry.signedAt).toLocaleString("pt-BR")}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Multiple Signatures (for conclusion reports) */}
        {entry.signatures && entry.signatures.length > 0 && (
          <div className="obras-report-viewer-section">
            <h3>
              <FiCheck size={20} /> {pluralize(entry.signatures.length, "Assinatura", "Assinaturas")}
            </h3>
            <div className="obras-report-viewer-signatures">
              {entry.signatures.map((sig) => (
                <div key={sig.id} className="obras-report-viewer-signature-item">
                  <strong>
                    {sig.name} - {sig.role}
                  </strong>
                  {sig.company && <span>{sig.company}</span>}
                  {sig.signedAt && <span>{new Date(sig.signedAt).toLocaleDateString("pt-BR")}</span>}
                  {sig.signature && <img src={sig.signature} alt={`Assinatura de ${sig.name}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="obras-report-viewer-metadata">
          {entry.createdAt && (
            <span><strong>Criado em:</strong> {new Date(entry.createdAt).toLocaleString("pt-BR")}</span>
          )}
          {entry.updatedAt && (
            <span><strong>Última atualização:</strong> {new Date(entry.updatedAt).toLocaleString("pt-BR")}</span>
          )}
          {entry.createdBy && (
            <span><strong>Criado por:</strong> {entry.createdBy}</span>
          )}
          {entry.lastModifiedBy && (
            <span><strong>Última modificação por:</strong> {entry.lastModifiedBy}</span>
          )}
        </div>
      </div>
    </div>
  );
}

