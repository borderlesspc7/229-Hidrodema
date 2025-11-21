import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type { Issue, Project } from "../../../../../services/obrasService";

interface IssuesFormProps {
  formData: {
    projectId: string;
    date: string;
    title: string;
    description: string;
    category:
      | "tecnico"
      | "financeiro"
      | "prazo"
      | "qualidade"
      | "seguranca"
      | "outro";
    priority: "baixa" | "media" | "alta" | "critica";
    status: "aberto" | "em-analise" | "resolvido" | "cancelado";
    responsible: string;
    solution: string;
    solvedDate: string;
  };
  projects: Project[];
  editingItem: Issue | null;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function IssuesForm({
  formData,
  projects,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: IssuesFormProps) {
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
            {editingItem ? "EDITAR PROBLEMA" : "NOVO PROBLEMA"}
          </h2>
          <p className="obras-form-subtitle">Registro de problemas e não conformidades</p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiAlertTriangle /> Informações do Problema
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
                <label>Categoria *</label>
                <select
                  className="obras-select"
                  value={formData.category}
                  onChange={(e) => onChange("category", e.target.value)}
                >
                  <option value="tecnico">Técnico</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="prazo">Prazo</option>
                  <option value="qualidade">Qualidade</option>
                  <option value="seguranca">Segurança</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
            <div className="obras-form-field">
              <label>Título *</label>
              <Input
                type="text"
                placeholder="Título do problema"
                value={formData.title}
                onChange={(value) => onChange("title", value)}
                required
              />
            </div>
            <div className="obras-form-field">
              <label>Descrição *</label>
              <textarea
                className="obras-textarea"
                placeholder="Descrição detalhada do problema..."
                value={formData.description}
                onChange={(e) => onChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Prioridade</label>
                <select
                  className="obras-select"
                  value={formData.priority}
                  onChange={(e) => onChange("priority", e.target.value)}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div className="obras-form-field">
                <label>Status</label>
                <select
                  className="obras-select"
                  value={formData.status}
                  onChange={(e) => onChange("status", e.target.value)}
                >
                  <option value="aberto">Aberto</option>
                  <option value="em-analise">Em Análise</option>
                  <option value="resolvido">Resolvido</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            <div className="obras-form-field">
              <label>Responsável</label>
              <Input
                type="text"
                placeholder="Nome do responsável pela resolução"
                value={formData.responsible}
                onChange={(value) => onChange("responsible", value)}
              />
            </div>
            <div className="obras-form-field">
              <label>Solução</label>
              <textarea
                className="obras-textarea"
                placeholder="Descrição da solução implementada..."
                value={formData.solution}
                onChange={(e) => onChange("solution", e.target.value)}
                rows={4}
              />
            </div>
            {formData.status === "resolvido" && (
              <div className="obras-form-field">
                <label>Data de Resolução</label>
                <Input
                  type="date"
                  placeholder=""
                  value={formData.solvedDate}
                  onChange={(value) => onChange("solvedDate", value)}
                />
              </div>
            )}
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
              {editingItem ? "Atualizar Problema" : "Salvar Problema"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

