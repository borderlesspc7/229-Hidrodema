import Button from "../../../../../components/ui/Button/Button";
import {
  FiArrowLeft,
  FiPlus,
  FiDollarSign,
  FiEdit3,
  FiTrash2,
  FiPieChart,
} from "react-icons/fi";
import type { Budget } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";

interface BudgetsListProps {
  budgets: Budget[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export default function BudgetsList({
  budgets,
  onViewChange,
  onEdit,
  onDelete,
}: BudgetsListProps) {
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

      <div className="obras-budgets-grid">
        {budgets.length === 0 ? (
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
          budgets.map((budget) => (
            <div key={budget.id} className="obras-budget-card">
              <div className="obras-budget-header">
                <h3>{budget.name}</h3>
                <span className="obras-budget-status">
                  {((budget.spentAmount / budget.totalAmount) * 100).toFixed(1)}
                  % gasto
                </span>
              </div>
              <div className="obras-budget-info">
                <p>
                  <strong>Total:</strong> R${" "}
                  {budget.totalAmount.toLocaleString()}
                </p>
                <p>
                  <strong>Gasto:</strong> R${" "}
                  {budget.spentAmount.toLocaleString()}
                </p>
                <p>
                  <strong>Restante:</strong> R${" "}
                  {(budget.totalAmount - budget.spentAmount).toLocaleString()}
                </p>
              </div>
              <div className="obras-budget-progress">
                <div className="obras-progress-bar">
                  <div
                    className="obras-progress-fill"
                    style={{
                      width: `${
                        (budget.spentAmount / budget.totalAmount) * 100
                      }%`,
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
          ))
        )}
      </div>
    </div>
  );
}

