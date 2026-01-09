import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import {
  FiCheckCircle,
  FiArrowLeft,
  FiPlus,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";
import type { QualityChecklist, Project } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";
import ProjectFilter from "../shared/ProjectFilter";
import ProjectBadge from "../shared/ProjectBadge";

interface QualityListProps {
  qualityChecklists: QualityChecklist[];
  projects: Project[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (checklist: QualityChecklist) => void;
  onDelete: (id: string) => void;
}

export default function QualityList({
  qualityChecklists,
  projects,
  onViewChange,
  onEdit,
  onDelete,
}: QualityListProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const filteredQualityChecklists =
    selectedProjectId === "" || selectedProjectId === "all"
      ? qualityChecklists
      : qualityChecklists.filter((q) => q.projectId === selectedProjectId);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "#6b7280";
      case "em-andamento":
        return "#3b82f6";
      case "concluida":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "em-andamento":
        return "Em Andamento";
      case "concluida":
        return "Concluída";
      default:
        return status;
    }
  };

  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>QUALIDADE</h2>
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
            onClick={() => onViewChange("new-quality")}
            className="obras-create-btn"
          >
            <FiPlus size={20} />
            Novo Checklist
          </Button>
        </div>
        <ProjectFilter
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      </div>

      <div className="obras-inventory-grid">
        {filteredQualityChecklists.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiCheckCircle size={64} />
            </div>
            <h3>Nenhum checklist de qualidade</h3>
            <Button
              variant="primary"
              onClick={() => onViewChange("new-quality")}
            >
              Criar Primeiro Checklist
            </Button>
          </div>
        ) : (
          filteredQualityChecklists.map((checklist) => (
            <div key={checklist.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{checklist.name}</h3>
                <span
                  style={{
                    color: "#ffffff",
                    background: getStatusColor(checklist.status),
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
                  {getStatusLabel(checklist.status)}
                </span>
              </div>
              <div className="obras-badge-container">
                <ProjectBadge
                  projectId={checklist.projectId}
                  projects={projects}
                  size="medium"
                />
              </div>
              <div className="obras-item-info">
                <p>
                  <strong>Descrição:</strong> {checklist.description}
                </p>
                <p>
                  <strong>Itens:</strong> {checklist.items?.length || 0}
                </p>
                <p>
                  <strong>Criado em:</strong>{" "}
                  {new Date(checklist.createdAt).toLocaleDateString("pt-BR")}
                </p>
                {checklist.createdBy && (
                  <p>
                    <strong>Criado por:</strong> {checklist.createdBy}
                  </p>
                )}
              </div>
              <div className="obras-item-actions">
                <Button
                  variant="secondary"
                  onClick={() => checklist.id && onEdit(checklist)}
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => checklist.id && onDelete(checklist.id)}
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

