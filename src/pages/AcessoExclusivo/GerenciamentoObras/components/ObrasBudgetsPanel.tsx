import Button from "../../../../components/ui/Button/Button";
import type { Budget } from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import { FiArrowLeft, FiPlus, FiDollarSign, FiEdit3, FiPieChart } from "react-icons/fi";

type Props = {
  budgets: Budget[];
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function ObrasBudgetsPanel({ budgets, setViewMode }: Props) {
  return (
    <div className="obras-budgets-container">
      <div className="obras-budgets-header">
        <h2>Sistema de Orçamentos</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-budgets-actions">
        <Button
          variant="primary"
          onClick={() => setViewMode("new-budget")}
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
            <Button variant="primary" onClick={() => setViewMode("new-budget")}>
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
                  <strong>Total:</strong> R$ {budget.totalAmount.toLocaleString()}
                </p>
                <p>
                  <strong>Gasto:</strong> R$ {budget.spentAmount.toLocaleString()}
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
                      width: `${(budget.spentAmount / budget.totalAmount) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="obras-budget-actions">
                <Button variant="secondary">
                  <FiEdit3 size={16} />
                  Editar
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
