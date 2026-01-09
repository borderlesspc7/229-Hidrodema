import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import {
  FiCalendar,
  FiArrowLeft,
  FiPlus,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";
import type { Schedule, Project } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";
import ProjectFilter from "../shared/ProjectFilter";
import ProjectBadge from "../shared/ProjectBadge";

interface ScheduleListProps {
  schedules: Schedule[];
  projects: Project[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
}

export default function ScheduleList({
  schedules,
  projects,
  onViewChange,
  onEdit,
  onDelete,
}: ScheduleListProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Filtrar cronograma por obra
  const filteredSchedules =
    selectedProjectId === "" || selectedProjectId === "all"
      ? schedules
      : schedules.filter((schedule) => schedule.projectId === selectedProjectId);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "nao-iniciado":
        return "Não Iniciado";
      case "em-andamento":
        return "Em Andamento";
      case "concluido":
        return "Concluído";
      case "atrasado":
        return "Atrasado";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "nao-iniciado":
        return "status-nao-iniciado";
      case "em-andamento":
        return "status-em-andamento";
      case "concluido":
        return "status-concluido";
      case "atrasado":
        return "status-atrasado";
      default:
        return "";
    }
  };

  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>CRONOGRAMA</h2>
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
            onClick={() => onViewChange("new-schedule")}
            className="obras-create-btn"
          >
            <FiPlus size={20} />
            Nova Tarefa
          </Button>
        </div>
        <ProjectFilter
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      </div>

      <div className="obras-inventory-grid">
        {filteredSchedules.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiCalendar size={64} />
            </div>
            <h3>Nenhuma tarefa cadastrada</h3>
            <Button
              variant="primary"
              onClick={() => onViewChange("new-schedule")}
            >
              Cadastrar Primeira Tarefa
            </Button>
          </div>
        ) : (
          filteredSchedules.map((schedule) => (
            <div key={schedule.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{schedule.taskName}</h3>
                <span className={getStatusClass(schedule.status)}>
                  {getStatusLabel(schedule.status)}
                </span>
              </div>
              <div className="obras-badge-container">
                <ProjectBadge
                  projectId={schedule.projectId}
                  projects={projects}
                  size="medium"
                />
              </div>
              <div className="obras-item-info">
                <p>
                  <strong>Início:</strong>{" "}
                  {new Date(schedule.startDate).toLocaleDateString("pt-BR")}
                </p>
                <p>
                  <strong>Término:</strong>{" "}
                  {new Date(schedule.endDate).toLocaleDateString("pt-BR")}
                </p>
                <p>
                  <strong>Progresso:</strong> {schedule.progress}%
                </p>
                {schedule.responsible && (
                  <p>
                    <strong>Responsável:</strong> {schedule.responsible}
                  </p>
                )}
                {schedule.plannedCost && (
                  <p>
                    <strong>Custo Planejado:</strong> R${" "}
                    {schedule.plannedCost.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                )}
              </div>
              <div className="obras-item-actions">
                <Button
                  variant="secondary"
                  onClick={() => schedule.id && onEdit(schedule)}
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => schedule.id && onDelete(schedule.id)}
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

