import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiPlus,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";
import type { Issue, Project } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";
import ProjectFilter from "../shared/ProjectFilter";
import ProjectBadge from "../shared/ProjectBadge";

interface IssuesListProps {
  issues: Issue[];
  projects: Project[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (issue: Issue) => void;
  onDelete: (id: string) => void;
}

export default function IssuesList({
  issues,
  projects,
  onViewChange,
  onEdit,
  onDelete,
}: IssuesListProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const filteredIssues =
    selectedProjectId === "" || selectedProjectId === "all"
      ? issues
      : issues.filter((issue) => issue.projectId === selectedProjectId);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "baixa":
        return "#10b981";
      case "media":
        return "#3b82f6";
      case "alta":
        return "#f59e0b";
      case "critica":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "baixa":
        return "Baixa";
      case "media":
        return "Média";
      case "alta":
        return "Alta";
      case "critica":
        return "Crítica";
      default:
        return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto":
        return "#3b82f6";
      case "em-analise":
        return "#f59e0b";
      case "resolvido":
        return "#10b981";
      case "cancelado":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aberto":
        return "Aberto";
      case "em-analise":
        return "Em Análise";
      case "resolvido":
        return "Resolvido";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "tecnico":
        return "Técnico";
      case "financeiro":
        return "Financeiro";
      case "prazo":
        return "Prazo";
      case "qualidade":
        return "Qualidade";
      case "seguranca":
        return "Segurança";
      case "outro":
        return "Outro";
      default:
        return category;
    }
  };

  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>PROBLEMAS</h2>
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
            onClick={() => onViewChange("new-issues")}
            className="obras-create-btn"
          >
            <FiPlus size={20} />
            Novo Problema
          </Button>
        </div>
        <ProjectFilter
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      </div>

      <div className="obras-inventory-grid">
        {filteredIssues.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiAlertTriangle size={64} />
            </div>
            <h3>Nenhum problema cadastrado</h3>
            <Button
              variant="primary"
              onClick={() => onViewChange("new-issues")}
            >
              Cadastrar Primeiro Problema
            </Button>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div key={issue.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{issue.title}</h3>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      color: "#ffffff",
                      background: getPriorityColor(issue.priority),
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
                    {getPriorityLabel(issue.priority)}
                  </span>
                  <span
                    style={{
                      color: "#ffffff",
                      background: getStatusColor(issue.status),
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
                    {getStatusLabel(issue.status)}
                  </span>
                </div>
              </div>
              <div className="obras-badge-container">
                <ProjectBadge
                  projectId={issue.projectId}
                  projects={projects}
                  size="medium"
                />
              </div>
              <div className="obras-item-info">
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(issue.date).toLocaleDateString("pt-BR")}
                </p>
                <p>
                  <strong>Categoria:</strong> {getCategoryLabel(issue.category)}
                </p>
                <p>
                  <strong>Descrição:</strong> {issue.description}
                </p>
                {issue.responsible && (
                  <p>
                    <strong>Responsável:</strong> {issue.responsible}
                  </p>
                )}
                {issue.solvedDate && (
                  <p>
                    <strong>Resolvido em:</strong>{" "}
                    {new Date(issue.solvedDate).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
              <div className="obras-item-actions">
                <Button
                  variant="secondary"
                  onClick={() => issue.id && onEdit(issue)}
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => issue.id && onDelete(issue.id)}
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

