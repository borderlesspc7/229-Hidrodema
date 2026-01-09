import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import { FiTool, FiArrowLeft, FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";
import type { Equipment, Project } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";
import ProjectFilter from "../shared/ProjectFilter";
import ProjectBadge from "../shared/ProjectBadge";

interface EquipmentListProps {
  equipment: Equipment[];
  projects: Project[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (item: Equipment) => void;
  onDelete: (id: string) => void;
}

export default function EquipmentList({
  equipment,
  projects,
  onViewChange,
  onEdit,
  onDelete,
}: EquipmentListProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Filtrar equipamentos por obra
  const filteredEquipment =
    selectedProjectId === "" || selectedProjectId === "all"
      ? equipment
      : equipment.filter((item) => item.projectId === selectedProjectId);

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

      <div className="obras-inventory-controls">
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
        <ProjectFilter
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      </div>

      <div className="obras-inventory-grid">
        {filteredEquipment.length === 0 ? (
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
          filteredEquipment.map((item) => (
            <div key={item.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{item.name}</h3>
                <span className={`status-${item.status}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
              <div className="obras-badge-container">
                <ProjectBadge
                  projectId={item.projectId}
                  projects={projects}
                  size="medium"
                />
              </div>
              <div className="obras-item-info">
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
                    {new Date(item.lastMaintenance).toLocaleDateString("pt-BR")}
                  </p>
                )}
                {item.nextMaintenance && (
                  <p>
                    <strong>Próxima Manutenção:</strong>{" "}
                    {new Date(item.nextMaintenance).toLocaleDateString("pt-BR")}
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

