import type { Dispatch, SetStateAction } from "react";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import Card from "../../../../components/ui/Card/Card";
import type { Project } from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import { FiArrowLeft, FiDollarSign, FiCheckCircle } from "react-icons/fi";

export type NewBudgetState = {
  name: string;
  description: string;
  totalAmount: number;
  projectId: string;
};

type Props = {
  projects: Project[];
  newBudget: NewBudgetState;
  setNewBudget: Dispatch<SetStateAction<NewBudgetState>>;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
  onSubmit: () => void | Promise<void>;
};

export default function ObrasNewBudgetForm({
  projects,
  newBudget,
  setNewBudget,
  setViewMode,
  onSubmit,
}: Props) {
  return (
    <div className="obras-form-container">
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">NOVO ORÇAMENTO</h2>
          <p className="obras-form-subtitle">Criar novo orçamento para projeto</p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiDollarSign /> Informações do Orçamento
            </h3>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome do Orçamento *</label>
                <Input
                  type="text"
                  placeholder="Nome do orçamento"
                  value={newBudget.name}
                  onChange={(value) =>
                    setNewBudget({ ...newBudget, name: value })
                  }
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Projeto Relacionado</label>
                <select
                  className="obras-select"
                  value={newBudget.projectId}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, projectId: e.target.value })
                  }
                >
                  <option value="">Selecione um projeto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Valor Total (R$) *</label>
                <Input
                  type="number"
                  placeholder="Valor total do orçamento"
                  value={newBudget.totalAmount.toString()}
                  onChange={(value) =>
                    setNewBudget({
                      ...newBudget,
                      totalAmount: parseFloat(value) || 0,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>Descrição</label>
              <textarea
                className="obras-textarea"
                placeholder="Descrição do orçamento..."
                value={newBudget.description}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, description: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => setViewMode("budgets")}
              className="obras-action-btn"
            >
              <FiArrowLeft size={16} />
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void onSubmit()}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              Criar Orçamento
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
