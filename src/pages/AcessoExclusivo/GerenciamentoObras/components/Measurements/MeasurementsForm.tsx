import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiActivity,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type {
  Measurement,
  Project,
} from "../../../../../services/obrasService";

interface MeasurementsFormProps {
  formData: {
    projectId: string;
    date: string;
    period: string;
    description: string;
    plannedPhysicalProgress: number;
    actualPhysicalProgress: number;
    plannedFinancialProgress: number;
    actualFinancialProgress: number;
    observations: string;
    approved: boolean;
    approvedBy: string;
  };
  projects: Project[];
  editingItem: Measurement | null;
  onChange: (field: string, value: string | number | boolean) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function MeasurementsForm({
  formData,
  projects,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: MeasurementsFormProps) {
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
            {editingItem ? "EDITAR MEDIÇÃO" : "NOVA MEDIÇÃO"}
          </h2>
          <p className="obras-form-subtitle">Registro de medições da obra</p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiActivity /> Informações da Medição
            </h3>
            <div className="obras-form-field">
              <label>Obra *</label>
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
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Data *</label>
                <Input
                  type="date"
                  placeholder=""
                  value={formData.date}
                  onChange={(value) => onChange("date", value)}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Período *</label>
                <Input
                  type="text"
                  placeholder="Ex: 1ª Medição, Janeiro/2024"
                  value={formData.period}
                  onChange={(value) => onChange("period", value)}
                  required
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>Descrição *</label>
              <Input
                type="text"
                placeholder="Descrição da medição"
                value={formData.description}
                onChange={(value) => onChange("description", value)}
                required
              />
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Progresso Físico Planejado (%)</label>
                <Input
                  type="text"
                  placeholder="Planejado"
                  value={formData.plannedPhysicalProgress.toString()}
                  onChange={(value) =>
                    onChange(
                      "plannedPhysicalProgress",
                      Math.min(100, Math.max(0, parseInt(value) || 0))
                    )
                  }
                  mask="number"
                  min={0}
                  max={100}
                />
              </div>
              <div className="obras-form-field">
                <label>Progresso Físico Real (%)</label>
                <Input
                  type="text"
                  placeholder="Real"
                  value={formData.actualPhysicalProgress.toString()}
                  onChange={(value) =>
                    onChange(
                      "actualPhysicalProgress",
                      Math.min(100, Math.max(0, parseInt(value) || 0))
                    )
                  }
                  mask="number"
                  min={0}
                  max={100}
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Progresso Financeiro Planejado (%)</label>
                <Input
                  type="text"
                  placeholder="Planejado"
                  value={formData.plannedFinancialProgress.toString()}
                  onChange={(value) =>
                    onChange(
                      "plannedFinancialProgress",
                      Math.min(100, Math.max(0, parseInt(value) || 0))
                    )
                  }
                  mask="number"
                  min={0}
                  max={100}
                />
              </div>
              <div className="obras-form-field">
                <label>Progresso Financeiro Real (%)</label>
                <Input
                  type="text"
                  placeholder="Real"
                  value={formData.actualFinancialProgress.toString()}
                  onChange={(value) =>
                    onChange(
                      "actualFinancialProgress",
                      Math.min(100, Math.max(0, parseInt(value) || 0))
                    )
                  }
                  mask="number"
                  min={0}
                  max={100}
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>Observações</label>
              <textarea
                className="obras-textarea"
                placeholder="Observações da medição..."
                value={formData.observations}
                onChange={(e) => onChange("observations", e.target.value)}
                rows={4}
              />
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.approved}
                    onChange={(e) => onChange("approved", e.target.checked)}
                    style={{ marginRight: "8px", width: "20px", height: "20px" }}
                  />
                  Aprovada
                </label>
              </div>
              <div className="obras-form-field">
                <label>Aprovada por</label>
                <Input
                  type="text"
                  placeholder="Nome de quem aprovou"
                  value={formData.approvedBy}
                  onChange={(value) => onChange("approvedBy", value)}
                />
              </div>
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
              {editingItem ? "Atualizar Medição" : "Salvar Medição"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

