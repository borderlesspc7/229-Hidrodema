import Button from "../../../../../components/ui/Button/Button";
import {
  FiShield,
  FiArrowLeft,
  FiPlus,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";
import type { SafetyRecord } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";

interface SafetyListProps {
  safetyRecords: SafetyRecord[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (record: SafetyRecord) => void;
  onDelete: (id: string) => void;
}

export default function SafetyList({
  safetyRecords,
  onViewChange,
  onEdit,
  onDelete,
}: SafetyListProps) {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "baixa":
        return "#10b981";
      case "media":
        return "#f59e0b";
      case "alta":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case "baixa":
        return "Baixa";
      case "media":
        return "Média";
      case "alta":
        return "Alta";
      default:
        return severity || "";
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      dds: "DDS",
      inspecao: "Inspeção",
      acidente: "Acidente",
      treinamento: "Treinamento",
      epi: "EPI",
    };
    return types[type] || type;
  };

  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>SEGURANÇA</h2>
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
          onClick={() => onViewChange("new-safety")}
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          Novo Registro
        </Button>
      </div>

      <div className="obras-inventory-grid">
        {safetyRecords.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiShield size={64} />
            </div>
            <h3>Nenhum registro de segurança</h3>
            <Button
              variant="primary"
              onClick={() => onViewChange("new-safety")}
            >
              Criar Primeiro Registro
            </Button>
          </div>
        ) : (
          safetyRecords.map((record) => (
            <div key={record.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{record.title}</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span
                    className="obras-item-badge"
                    style={{ backgroundColor: "#3b82f6" }}
                  >
                    {getTypeLabel(record.type)}
                  </span>
                  {record.severity && (
                    <span
                      className="obras-item-badge"
                      style={{
                        backgroundColor: getSeverityColor(record.severity),
                      }}
                    >
                      {getSeverityLabel(record.severity)}
                    </span>
                  )}
                </div>
              </div>
              <div className="obras-item-details">
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(record.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Responsável:</strong> {record.responsible}
                </p>
                <p>
                  <strong>Descrição:</strong> {record.description}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {record.status === "pendente"
                    ? "Pendente"
                    : record.status === "em-andamento"
                    ? "Em Andamento"
                    : "Concluído"}
                </p>
              </div>
              <div className="obras-item-actions">
                <Button
                  variant="secondary"
                  onClick={() => record.id && onEdit(record)}
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => record.id && onDelete(record.id)}
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

