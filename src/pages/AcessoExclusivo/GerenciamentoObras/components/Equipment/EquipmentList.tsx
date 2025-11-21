import Button from "../../../../../components/ui/Button/Button";
import { FiTool, FiArrowLeft, FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";
import type { Equipment } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";

interface EquipmentListProps {
  equipment: Equipment[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (item: Equipment) => void;
  onDelete: (id: string) => void;
}

export default function EquipmentList({
  equipment,
  onViewChange,
  onEdit,
  onDelete,
}: EquipmentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponivel":
        return "#10b981";
      case "em-uso":
        return "#3b82f6";
      case "manutencao":
        return "#f59e0b";
      case "quebrado":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "disponivel":
        return "Disponível";
      case "em-uso":
        return "Em Uso";
      case "manutencao":
        return "Manutenção";
      case "quebrado":
        return "Quebrado";
      default:
        return status;
    }
  };

  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>EQUIPAMENTOS</h2>
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
          onClick={() => onViewChange("new-equipment")}
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          Novo Equipamento
        </Button>
      </div>

      <div className="obras-inventory-grid">
        {equipment.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiTool size={64} />
            </div>
            <h3>Nenhum equipamento cadastrado</h3>
            <Button
              variant="primary"
              onClick={() => onViewChange("new-equipment")}
            >
              Cadastrar Primeiro Equipamento
            </Button>
          </div>
        ) : (
          equipment.map((item) => (
            <div key={item.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{item.name}</h3>
                <span
                  className="obras-item-badge"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                >
                  {getStatusLabel(item.status)}
                </span>
              </div>
              <div className="obras-item-details">
                <p>
                  <strong>Tipo:</strong> {item.type}
                </p>
                {item.code && (
                  <p>
                    <strong>Código:</strong> {item.code}
                  </p>
                )}
                {item.operator && (
                  <p>
                    <strong>Operador:</strong> {item.operator}
                  </p>
                )}
                {item.hoursUsed !== undefined && (
                  <p>
                    <strong>Horas de Uso:</strong> {item.hoursUsed}h
                  </p>
                )}
                {item.lastMaintenance && (
                  <p>
                    <strong>Última Manutenção:</strong>{" "}
                    {new Date(item.lastMaintenance).toLocaleDateString()}
                  </p>
                )}
                {item.nextMaintenance && (
                  <p>
                    <strong>Próxima Manutenção:</strong>{" "}
                    {new Date(item.nextMaintenance).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="obras-item-actions">
                <Button
                  variant="secondary"
                  onClick={() => item.id && onEdit(item)}
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => item.id && onDelete(item.id)}
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

