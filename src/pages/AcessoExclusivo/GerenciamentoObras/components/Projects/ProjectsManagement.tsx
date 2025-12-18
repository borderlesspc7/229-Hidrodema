import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiArrowLeft,
  FiTool,
  FiRefreshCw,
  FiCheckCircle,
  FiTrendingUp,
  FiEdit3,
  FiTrash2,
  FiBarChart,
} from "react-icons/fi";
import type { Project } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";

interface ProjectsManagementProps {
  projects: Project[];
  editingProject: Project | null;
  newProject: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    client: string;
    budget: number;
    team: string[];
    labor: string;
  };
  onViewChange: (mode: ViewMode) => void;
  onProjectChange: (field: string, value: string | number) => void;
  onResetForm: () => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectsManagement({
  projects,
  editingProject,
  newProject,
  onViewChange,
  onProjectChange,
  onResetForm,
  onCreateProject,
  onEditProject,
  onDeleteProject,
}: ProjectsManagementProps) {
  return (
    <div className="obras-projects-container">
      <div className="obras-projects-header">
        <h2>Criar Obra</h2>
        <Button
          variant="primary"
          onClick={() => onViewChange("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-projects-form-section">
        <Card
          variant="service"
          className="obras-form-card"
          title=""
          textColor="#1e293b"
        >
          <div className="obras-form-header">
            <h2 className="obras-form-title">
              {editingProject ? "EDITAR OBRA" : "CADASTRAR NOVA OBRA"}
            </h2>
            <p className="obras-form-subtitle">
              Registre uma obra para utilizá-la em relatórios e acompanhamentos
            </p>
          </div>

          <div className="obras-form-content">
            <div className="obras-section">
              <h3 className="obras-section-title">
                <FiTool /> Informações da Obra
              </h3>
              <div className="obras-form-row">
                <div className="obras-form-field">
                  <label>Nome da Obra *</label>
                  <Input
                    type="text"
                    placeholder="Nome da obra"
                    value={newProject.name}
                    onChange={(value) => onProjectChange("name", value)}
                    required
                  />
                </div>
                <div className="obras-form-field">
                  <label>Cliente *</label>
                  <Input
                    type="text"
                    placeholder="Nome do cliente"
                    value={newProject.client}
                    onChange={(value) => onProjectChange("client", value)}
                    required
                  />
                </div>
              </div>

              <div className="obras-form-row">
                <div className="obras-form-field">
                  <label>Data de Início *</label>
                  <Input
                    type="date"
                    placeholder="Data de início"
                    value={newProject.startDate}
                    onChange={(value) => onProjectChange("startDate", value)}
                    required
                  />
                </div>
                <div className="obras-form-field">
                  <label>Data de Término *</label>
                  <Input
                    type="date"
                    placeholder="Data de término"
                    value={newProject.endDate}
                    onChange={(value) => onProjectChange("endDate", value)}
                    required
                  />
                </div>
              </div>

              <div className="obras-form-row">
                <div className="obras-form-field">
                  <label>Orçamento (R$)</label>
                  <Input
                    type="text"
                    placeholder="Valor do orçamento"
                    value={(newProject.budget * 100).toString()}
                    onChange={(value) =>
                      onProjectChange("budget", (parseFloat(value) || 0) / 100)
                    }
                    mask="currency"
                    min={0}
                  />
                </div>
                <div className="obras-form-field">
                  <label>Mão de Obra</label>
                  <Input
                    type="text"
                    placeholder="Equipe, empresa ou observações"
                    value={newProject.labor}
                    onChange={(value) => onProjectChange("labor", value)}
                  />
                </div>
              </div>

              <div className="obras-form-field">
                <label>Descrição</label>
                <textarea
                  className="obras-textarea"
                  placeholder="Descrição do projeto..."
                  value={newProject.description}
                  onChange={(e) =>
                    onProjectChange("description", e.target.value)
                  }
                  rows={4}
                />
              </div>
            </div>

            <div className="obras-form-actions">
              <Button
                variant="secondary"
                onClick={onResetForm}
                className="obras-action-btn"
              >
                <FiRefreshCw size={16} />
                Limpar
              </Button>
              <Button
                variant="primary"
                onClick={onCreateProject}
                className="obras-action-btn obras-submit-btn"
              >
                <FiCheckCircle size={16} />
                {editingProject ? "Atualizar Obra" : "Salvar Obra"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="obras-projects-list-section">
        <h3 className="obras-projects-list-title">Obras cadastradas</h3>
        <div className="obras-projects-grid">
          {projects.length === 0 ? (
            <div className="obras-empty-state">
              <div className="obras-empty-icon">
                <FiTrendingUp size={64} />
              </div>
              <h3>Nenhuma obra cadastrada</h3>
              <p>Utilize o formulário acima para registrar sua primeira obra</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id || `project-${project.name}`}
                className="obras-project-card"
              >
                <div className="obras-project-header">
                  <h3>{project.name}</h3>
                  <span
                    className={`obras-project-status obras-status-${project.status}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="obras-project-info">
                  <p>
                    <strong>Cliente:</strong> {project.client}
                  </p>
                  <p>
                    <strong>Mão de Obra:</strong>{" "}
                    {project.labor || "Não informado"}
                  </p>
                  <p>
                    <strong>Orçamento:</strong> R${" "}
                    {project.budget.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p>
                    <strong>Gasto:</strong> R${" "}
                    {project.spent.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="obras-project-progress">
                  <p>
                    <strong>Progresso</strong> <span>{project.progress}%</span>
                  </p>
                  <div className="obras-progress-bar">
                    <div
                      className="obras-progress-fill"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="obras-project-actions">
                  <Button
                    variant="secondary"
                    onClick={() => project.id && onEditProject(project)}
                  >
                    <FiEdit3 size={16} />
                    Editar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => project.id && onDeleteProject(project.id)}
                    className="obras-delete"
                  >
                    <FiTrash2 size={16} />
                    Excluir
                  </Button>
                  <Button variant="primary">
                    <FiBarChart size={16} />
                    Relatório
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

