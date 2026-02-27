import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import { FiUsers, FiArrowLeft, FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";
import type { TeamMember, Project } from "../../../../../services/obrasService";
import type { ViewMode, ViewChangeContext } from "../../types";
import ProjectFilter from "../shared/ProjectFilter";
import ProjectBadge from "../shared/ProjectBadge";

interface TeamListProps {
  teamMembers: TeamMember[];
  projects: Project[];
  onViewChange: (mode: ViewMode, context?: ViewChangeContext) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

export default function TeamList({
  teamMembers,
  projects,
  onViewChange,
  onEdit,
  onDelete,
}: TeamListProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Filtrar membros por obra
  const filteredTeamMembers =
    selectedProjectId === "" || selectedProjectId === "all"
      ? teamMembers
      : teamMembers.filter((member) => member.projectId === selectedProjectId);

  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>EQUIPE</h2>
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
            onClick={() => onViewChange("new-team", selectedProjectId ? { projectId: selectedProjectId } : undefined)}
            className="obras-create-btn"
          >
            <FiPlus size={20} />
            Novo Membro
          </Button>
        </div>
        <ProjectFilter
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      </div>

      <div className="obras-inventory-grid">
        {filteredTeamMembers.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiUsers size={64} />
            </div>
            <h3>Nenhum membro cadastrado</h3>
            <Button variant="primary" onClick={() => onViewChange("new-team", selectedProjectId ? { projectId: selectedProjectId } : undefined)}>
              Cadastrar Primeiro Membro
            </Button>
          </div>
        ) : (
          filteredTeamMembers.map((member) => (
            <div key={member.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{member.name}</h3>
                {member.attendance && (
                  <span className="obras-item-status normal">
                    Presente
                  </span>
                )}
              </div>
              <div className="obras-badge-container">
                <ProjectBadge
                  projectId={member.projectId}
                  projects={projects}
                  size="medium"
                />
              </div>
              <div className="obras-item-info">
                <p>
                  <strong>Função:</strong> {member.role}
                </p>
                {member.phone && (
                  <p>
                    <strong>Telefone:</strong> {member.phone}
                  </p>
                )}
                {member.cpf && (
                  <p>
                    <strong>CPF:</strong> {member.cpf}
                  </p>
                )}
                {member.hourlyRate && (
                  <p>
                    <strong>Valor/Hora:</strong> R${" "}
                    {member.hourlyRate.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                )}
                {member.workHours && (
                  <p>
                    <strong>Horas Trabalhadas:</strong> {member.workHours}h
                  </p>
                )}
                {member.checkInTime && (
                  <p>
                    <strong>Entrada:</strong> {member.checkInTime}
                  </p>
                )}
                {member.checkOutTime && (
                  <p>
                    <strong>Saída:</strong> {member.checkOutTime}
                  </p>
                )}
              </div>
              <div className="obras-item-actions">
                <Button
                  variant="secondary"
                  onClick={() => member.id && onEdit(member)}
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => member.id && onDelete(member.id)}
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

