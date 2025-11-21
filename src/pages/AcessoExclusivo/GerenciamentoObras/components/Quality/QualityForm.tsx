import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiCheckCircle,
  FiRefreshCw,
  FiArrowLeft,
} from "react-icons/fi";
import type {
  QualityChecklist,
  Project,
} from "../../../../../services/obrasService";

interface QualityFormProps {
  formData: {
    projectId: string;
    name: string;
    description: string;
    status: "pendente" | "em-andamento" | "concluida";
    createdBy: string;
  };
  projects: Project[];
  editingItem: QualityChecklist | null;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function QualityForm({
  formData,
  projects,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: QualityFormProps) {
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
            {editingItem ? "EDITAR CHECKLIST" : "NOVO CHECKLIST DE QUALIDADE"}
          </h2>
          <p className="obras-form-subtitle">
            Controle de qualidade da obra
          </p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiCheckCircle /> Informações do Checklist
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
            <div className="obras-form-field">
              <label>Nome do Checklist *</label>
              <Input
                type="text"
                placeholder="Nome do checklist"
                value={formData.name}
                onChange={(value) => onChange("name", value)}
                required
              />
            </div>
            <div className="obras-form-field">
              <label>Descrição *</label>
              <textarea
                className="obras-textarea"
                placeholder="Descrição do checklist..."
                value={formData.description}
                onChange={(e) => onChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Status</label>
                <select
                  className="obras-select"
                  value={formData.status}
                  onChange={(e) => onChange("status", e.target.value)}
                >
                  <option value="pendente">Pendente</option>
                  <option value="em-andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>
              <div className="obras-form-field">
                <label>Criado por</label>
                <Input
                  type="text"
                  placeholder="Nome do responsável"
                  value={formData.createdBy}
                  onChange={(value) => onChange("createdBy", value)}
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
              {editingItem ? "Atualizar Checklist" : "Salvar Checklist"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

