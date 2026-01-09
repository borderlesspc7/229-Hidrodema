import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import {
  FiArrowLeft,
  FiPlus,
  FiDollarSign,
  FiEdit3,
  FiTrash2,
  FiPieChart,
} from "react-icons/fi";
import type { Budget, Project } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";
import ProjectFilter from "../shared/ProjectFilter";
import ProjectBadge from "../shared/ProjectBadge";

interface BudgetsListProps {
  budgets: Budget[];
  projects: Project[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export default function BudgetsList({
  budgets,
  projects,
  onViewChange,
  onEdit,
  onDelete,
}: BudgetsListProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Filtrar orçamentos por obra
  const filteredBudgets =
    selectedProjectId === "" || selectedProjectId === "all"
      ? budgets
      : budgets.filter((budget) => budget.projectId === selectedProjectId);

  return (
    <div className="obras-budgets-container">
      <div className="obras-budgets-header">
        <h2>Sistema de Orçamentos</h2>
        <Button
          variant="primary"
          onClick={() => onViewChange("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-budgets-controls">
        <div className="obras-budgets-actions">
          <Button
            variant="primary"
            onClick={() => onViewChange("new-budget")}
            className="obras-create-btn"
          >
            <FiPlus size={20} />
            Novo Orçamento
          </Button>
        </div>
        <ProjectFilter
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      </div>

      <div className="obras-budgets-grid">
        {filteredBudgets.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiDollarSign size={64} />
            </div>
            <h3>Nenhum orçamento encontrado</h3>
            <p>Crie seu primeiro orçamento</p>
            <Button variant="primary" onClick={() => onViewChange("new-budget")}>
              Criar Primeiro Orçamento
            </Button>
          </div>
        ) : (
          filteredBudgets.map((budget) => {
            const percentage = (budget.spentAmount / budget.totalAmount) * 100;
            return (
              <div key={budget.id} className="obras-budget-card">
                <div className="obras-budget-header">
                  <h3>{budget.name}</h3>
                  <div className="obras-budget-badges">
                    <span className="obras-gasto-badge">
                      {percentage.toFixed(1)}% gasto
                    </span>
                  </div>
                </div>
                <div className="obras-badge-container">
                  <ProjectBadge
                    projectId={budget.projectId}
                    projects={projects}
                    size="medium"
                  />
                </div>
                <div className="obras-budget-info">
                  <p>
                    <strong>Total:</strong> R${" "}
                    {budget.totalAmount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p>
                    <strong>Gasto:</strong> R${" "}
                    {budget.spentAmount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p>
                    <strong>Restante:</strong> R${" "}
                    {(budget.totalAmount - budget.spentAmount).toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>
                <div className="obras-budget-progress">
                  <p>
                    <strong>Execução do Orçamento</strong>{" "}
                    <span>{percentage.toFixed(1)}%</span>
                  </p>
                  <div className="obras-progress-bar">
                    <div
                      className="obras-progress-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="obras-budget-actions">
                  <Button
                    variant="secondary"
                    onClick={() => budget.id && onEdit(budget)}
                  >
                    <FiEdit3 size={16} />
                    Editar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => budget.id && onDelete(budget.id)}
                    className="obras-delete"
                  >
                    <FiTrash2 size={16} />
                    Excluir
                  </Button>
                  <Button variant="primary">
                    <FiPieChart size={16} />
                    Detalhes
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

