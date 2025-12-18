import Button from "../../../../../components/ui/Button/Button";
import {
  FiFile,
  FiArrowLeft,
  FiPlus,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";
import type { DocumentRecord } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";

interface DocumentsListProps {
  documents: DocumentRecord[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (document: DocumentRecord) => void;
  onDelete: (id: string) => void;
}

export default function DocumentsList({
  documents,
  onViewChange,
  onEdit,
  onDelete,
}: DocumentsListProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      projeto: "#3b82f6",
      art: "#10b981",
      contrato: "#f59e0b",
      licenca: "#ef4444",
      orcamento: "#8b5cf6",
      medicao: "#06b6d4",
      outro: "#6b7280",
    };
    return colors[type] || "#6b7280";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      projeto: "Projeto",
      art: "ART",
      contrato: "Contrato",
      licenca: "Licença",
      orcamento: "Orçamento",
      medicao: "Medição",
      outro: "Outro",
    };
    return labels[type] || type;
  };

  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>DOCUMENTOS</h2>
        <Button
          variant="primary"
          onClick={() => onViewChange("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-inventory-actions">
        <Button
          variant="primary"
          onClick={() => onViewChange("new-documents")}
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          Novo Documento
        </Button>
      </div>

      <div className="obras-inventory-grid">
        {documents.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiFile size={64} />
            </div>
            <h3>Nenhum documento cadastrado</h3>
            <Button
              variant="primary"
              onClick={() => onViewChange("new-documents")}
            >
              Cadastrar Primeiro Documento
            </Button>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{doc.name}</h3>
                <span
                  style={{
                    color: "#ffffff",
                    background: getTypeColor(doc.type),
                    padding: "8px 16px",
                    borderRadius: "24px",
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "inline-flex",
                    alignItems: "center",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {getTypeLabel(doc.type)}
                </span>
              </div>
              <div className="obras-item-info">
                <p>
                  <strong>Data de Upload:</strong>{" "}
                  {new Date(doc.uploadDate).toLocaleDateString("pt-BR")}
                </p>
                {doc.description && (
                  <p>
                    <strong>Descrição:</strong> {doc.description}
                  </p>
                )}
                {doc.version && (
                  <p>
                    <strong>Versão:</strong> {doc.version}
                  </p>
                )}
                {doc.uploadedBy && (
                  <p>
                    <strong>Enviado por:</strong> {doc.uploadedBy}
                  </p>
                )}
              </div>
              <div className="obras-item-actions">
                <Button
                  variant="secondary"
                  onClick={() => doc.id && onEdit(doc)}
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => doc.id && onDelete(doc.id)}
                  className="obras-delete"
                >
                  <FiTrash2 size={16} />
                  Excluir
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

