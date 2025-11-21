import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiShield,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type {
  SafetyRecord,
  Project,
} from "../../../../../services/obrasService";

interface SafetyFormProps {
  formData: {
    projectId: string;
    date: string;
    type: "dds" | "inspecao" | "acidente" | "treinamento" | "epi";
    title: string;
    description: string;
    responsible: string;
    severity: "baixa" | "media" | "alta";
    correctedActions: string;
    status: "pendente" | "em-andamento" | "concluido";
  };
  projects: Project[];
  editingItem: SafetyRecord | null;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function SafetyForm({
  formData,
  projects,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: SafetyFormProps) {
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
            {editingItem ? "EDITAR REGISTRO" : "NOVO REGISTRO DE SEGURANÇA"}
          </h2>
          <p className="obras-form-subtitle">
            Registro de segurança do trabalho
          </p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiShield /> Informações do Registro
            </h3>
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
                <label>Tipo *</label>
                <select
                  className="obras-select"
                  value={formData.type}
                  onChange={(e) => onChange("type", e.target.value)}
                >
                  <option value="dds">DDS</option>
                  <option value="inspecao">Inspeção</option>
                  <option value="acidente">Acidente</option>
                  <option value="treinamento">Treinamento</option>
                  <option value="epi">EPI</option>
                </select>
              </div>
            </div>
            <div className="obras-form-field">
              <label>Título *</label>
              <Input
                type="text"
                placeholder="Título do registro"
                value={formData.title}
                onChange={(value) => onChange("title", value)}
                required
              />
            </div>
            <div className="obras-form-field">
              <label>Descrição *</label>
              <textarea
                className="obras-textarea"
                placeholder="Descrição detalhada..."
                value={formData.description}
                onChange={(e) => onChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Responsável *</label>
                <Input
                  type="text"
                  placeholder="Nome do responsável"
                  value={formData.responsible}
                  onChange={(value) => onChange("responsible", value)}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Gravidade</label>
                <select
                  className="obras-select"
                  value={formData.severity}
                  onChange={(e) => onChange("severity", e.target.value)}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>
            <div className="obras-form-field">
              <label>Status</label>
              <select
                className="obras-select"
                value={formData.status}
                onChange={(e) => onChange("status", e.target.value)}
              >
                <option value="pendente">Pendente</option>
                <option value="em-andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
            <div className="obras-form-field">
              <label>Ações Corretivas</label>
              <textarea
                className="obras-textarea"
                placeholder="Descreva as ações corretivas tomadas..."
                value={formData.correctedActions}
                onChange={(e) => onChange("correctedActions", e.target.value)}
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
              {editingItem ? "Atualizar Registro" : "Salvar Registro"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

