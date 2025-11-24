import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import ProjectSelector from "../shared/ProjectSelector";
import {
  FiTool,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type { Equipment, Project } from "../../../../../services/obrasService";

interface EquipmentFormProps {
  projects: Project[];
  formData: {
    name: string;
    type: string;
    code: string;
    status: "disponivel" | "em-uso" | "manutencao" | "quebrado";
    projectId?: string;
    lastMaintenance: string;
    nextMaintenance: string;
    operator: string;
    hoursUsed: number;
    notes: string;
  };
  editingItem: Equipment | null;
  onChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function EquipmentForm({
  projects,
  formData,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: EquipmentFormProps) {
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
            {editingItem ? "EDITAR EQUIPAMENTO" : "NOVO EQUIPAMENTO"}
          </h2>
          <p className="obras-form-subtitle">Cadastro de equipamentos</p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiTool /> Informações do Equipamento
            </h3>
            <ProjectSelector
              projects={projects}
              value={formData.projectId || ""}
              onChange={(value) => onChange("projectId", value)}
              required={false}
              label="Obra Relacionada (opcional)"
            />
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome do Equipamento *</label>
                <Input
                  type="text"
                  placeholder="Nome do equipamento"
                  value={formData.name}
                  onChange={(value) => onChange("name", value)}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Tipo *</label>
                <Input
                  type="text"
                  placeholder="Ex: Betoneira, Escavadeira"
                  value={formData.type}
                  onChange={(value) => onChange("type", value)}
                  required
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Código/Placa</label>
                <Input
                  type="text"
                  placeholder="Código de identificação"
                  value={formData.code}
                  onChange={(value) => onChange("code", value)}
                />
              </div>
              <div className="obras-form-field">
                <label>Status</label>
                <select
                  className="obras-select"
                  value={formData.status}
                  onChange={(e) => onChange("status", e.target.value)}
                >
                  <option value="disponivel">Disponível</option>
                  <option value="em-uso">Em Uso</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="quebrado">Quebrado</option>
                </select>
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Operador</label>
                <Input
                  type="text"
                  placeholder="Nome do operador"
                  value={formData.operator}
                  onChange={(value) => onChange("operator", value)}
                />
              </div>
              <div className="obras-form-field">
                <label>Horas de Uso</label>
                <Input
                  type="text"
                  placeholder="Horas"
                  value={formData.hoursUsed.toString()}
                  onChange={(value) =>
                    onChange("hoursUsed", parseInt(value) || 0)
                  }
                  mask="number"
                  min={0}
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Última Manutenção</label>
                <Input
                  type="date"
                  placeholder=""
                  value={formData.lastMaintenance}
                  onChange={(value) => onChange("lastMaintenance", value)}
                />
              </div>
              <div className="obras-form-field">
                <label>Próxima Manutenção</label>
                <Input
                  type="date"
                  placeholder=""
                  value={formData.nextMaintenance}
                  onChange={(value) => onChange("nextMaintenance", value)}
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>Observações</label>
              <textarea
                className="obras-textarea"
                placeholder="Observações sobre o equipamento..."
                value={formData.notes}
                onChange={(e) => onChange("notes", e.target.value)}
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
              {editingItem ? "Atualizar Equipamento" : "Salvar Equipamento"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

