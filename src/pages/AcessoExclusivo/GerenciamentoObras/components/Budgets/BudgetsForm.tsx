import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiDollarSign,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type { Budget, Project } from "../../../../../services/obrasService";

interface BudgetsFormProps {
  formData: {
    name: string;
    description: string;
    totalAmount: number;
    projectId: string;
  };
  projects: Project[];
  editingItem: Budget | null;
  onChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function BudgetsForm({
  formData,
  projects,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: BudgetsFormProps) {
  return (
    <div className="obras-form-container">
      <Button variant="secondary" onClick={onBack} className="obras-back-btn">
        <FiArrowLeft size={16} />
        Voltar
      </Button>
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">
            {editingItem ? "EDITAR ORÇAMENTO" : "NOVO ORÇAMENTO"}
          </h2>
          <p className="obras-form-subtitle">
            Criar orçamento para controle financeiro
          </p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiDollarSign /> Informações do Orçamento
            </h3>
            <div className="obras-form-field">
              <label>Nome do Orçamento *</label>
              <Input
                type="text"
                placeholder="Nome do orçamento"
                value={formData.name}
                onChange={(value) => onChange("name", value)}
                required
              />
            </div>
            <div className="obras-form-field">
              <label>Valor Total (R$) *</label>
              <Input
                type="text"
                placeholder="Valor total"
                value={(formData.totalAmount * 100).toString()}
                onChange={(value) =>
                  onChange("totalAmount", (parseFloat(value) || 0) / 100)
                }
                mask="currency"
                min={0}
                required
              />
            </div>
            <div className="obras-form-field">
              <label>Obra</label>
              <select
                className="obras-select"
                value={formData.projectId}
                onChange={(e) => onChange("projectId", e.target.value)}
              >
                <option value="">Selecione uma obra</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id || ""}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="obras-form-field">
              <label>Descrição</label>
              <textarea
                className="obras-textarea"
                placeholder="Descrição do orçamento..."
                value={formData.description}
                onChange={(e) => onChange("description", e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={onReset}
              className="obras-action-btn"
            >
              <FiRefreshCw size={16} />
              Limpar
            </Button>
            <Button
              variant="primary"
              onClick={onSubmit}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              {editingItem ? "Atualizar Orçamento" : "Salvar Orçamento"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
