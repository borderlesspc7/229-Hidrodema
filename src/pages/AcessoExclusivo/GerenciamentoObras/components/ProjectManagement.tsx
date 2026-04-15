import type { Dispatch, SetStateAction } from "react";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import Card from "../../../../components/ui/Card/Card";
import type { Project } from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import {
  FiArrowLeft,
  FiTool,
  FiRefreshCw,
  FiCheckCircle,
  FiTrendingUp,
  FiEdit3,
  FiBarChart,
} from "react-icons/fi";

type NewProjectState = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  client: string;
  budget: number;
  team: string[];
  labor: string;
};

type Props = {
  projects: Project[];
  newProject: NewProjectState;
  setNewProject: Dispatch<SetStateAction<NewProjectState>>;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
  onResetNewProjectForm: () => void;
  onCreateProject: () => void;
  onOpenOverview: (projectId: string) => void;
  onUpdateProjectStatus: (projectId: string, status: Project["status"]) => void;
};

export default function ProjectManagement({
  projects,
  newProject,
  setNewProject,
  setViewMode,
  onResetNewProjectForm,
  onCreateProject,
  onOpenOverview,
  onUpdateProjectStatus,
}: Props) {
  return (
    <div className="obras-projects-container">
      <div className="obras-projects-header">
        <h2>Obras</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
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
            <h2 className="obras-form-title">Cadastrar Nova Obra</h2>
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
                    onChange={(value) =>
                      setNewProject({ ...newProject, name: value })
                    }
                    required
                  />
                </div>
                <div className="obras-form-field">
                  <label>Cliente *</label>
                  <Input
                    type="text"
                    placeholder="Nome do cliente"
                    value={newProject.client}
                    onChange={(value) =>
                      setNewProject({ ...newProject, client: value })
                    }
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
                    onChange={(value) =>
                      setNewProject({ ...newProject, startDate: value })
                    }
                    required
                  />
                </div>
                <div className="obras-form-field">
                  <label>Data de Término *</label>
                  <Input
                    type="date"
                    placeholder="Data de término"
                    value={newProject.endDate}
                    onChange={(value) =>
                      setNewProject({ ...newProject, endDate: value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="obras-form-row">
                <div className="obras-form-field">
                  <label>Orçamento (R$)</label>
                  <Input
                    type="number"
                    placeholder="Valor do orçamento"
                    value={newProject.budget.toString()}
                    onChange={(value) =>
                      setNewProject({
                        ...newProject,
                        budget: parseFloat(value) || 0,
                      })
                    }
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
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
            </div>

            <div className="obras-form-actions">
              <Button
                variant="secondary"
                onClick={() => onResetNewProjectForm()}
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
                Salvar Obra
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
              <div key={project.id} className="obras-project-card">
                <div className="obras-project-header">
                  <h3>{project.name}</h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span
                      className={`obras-project-status obras-status-${project.status}`}
                    >
                      {project.status}
                    </span>
                    <select
                      className="obras-select"
                      value={project.status}
                      onChange={(e) =>
                        onUpdateProjectStatus(
                          project.id,
                          e.target.value as Project["status"]
                        )
                      }
                      aria-label="Editar status da obra"
                    >
                      <option value="planejamento">planejamento</option>
                      <option value="em-andamento">em-andamento</option>
                      <option value="pausada">pausada</option>
                      <option value="concluida">concluida</option>
                    </select>
                  </div>
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
                    {project.budget.toLocaleString()}
                  </p>
                  <p>
                    <strong>Gasto:</strong> R$ {project.spent.toLocaleString()}
                  </p>
                  <p>
                    <strong>Progresso:</strong> {project.progress}%
                  </p>
                </div>
                <div className="obras-project-progress">
                  <div className="obras-progress-bar">
                    <div
                      className="obras-progress-fill"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="obras-project-actions">
                  <Button variant="secondary">
                    <FiEdit3 size={16} />
                    Editar
                  </Button>
                  <Button variant="primary" onClick={() => onOpenOverview(project.id)}>
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
