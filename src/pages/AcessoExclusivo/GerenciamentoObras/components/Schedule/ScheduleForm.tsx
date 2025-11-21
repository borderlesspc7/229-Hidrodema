import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiCalendar,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type { Schedule, Project } from "../../../../../services/obrasService";

interface ScheduleFormProps {
  formData: {
    projectId: string;
    taskName: string;
    startDate: string;
    endDate: string;
    progress: number;
    responsible: string;
    status: "nao-iniciado" | "em-andamento" | "concluido" | "atrasado";
    plannedCost: number;
    actualCost: number;
  };
  projects: Project[];
  editingItem: Schedule | null;
  onChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function ScheduleForm({
  formData,
  projects,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: ScheduleFormProps) {
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
            {editingItem ? "EDITAR TAREFA" : "NOVA TAREFA"}
          </h2>
          <p className="obras-form-subtitle">Cadastro de tarefas no cronograma</p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiCalendar /> Informações da Tarefa
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
            <div className="obras-form-field">
              <label>Nome da Tarefa *</label>
              <Input
                type="text"
                placeholder="Descrição da tarefa"
                value={formData.taskName}
                onChange={(value) => onChange("taskName", value)}
                required
              />
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Data de Início *</label>
                <Input
                  type="date"
                  placeholder=""
                  value={formData.startDate}
                  onChange={(value) => onChange("startDate", value)}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Data de Término *</label>
                <Input
                  type="date"
                  placeholder=""
                  value={formData.endDate}
                  onChange={(value) => onChange("endDate", value)}
                  required
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Progresso (%)</label>
                <Input
                  type="text"
                  placeholder="Progresso"
                  value={formData.progress.toString()}
                  onChange={(value) => {
                    const num = parseInt(value) || 0;
                    onChange("progress", Math.min(100, Math.max(0, num)));
                  }}
                  mask="number"
                  min={0}
                  max={100}
                />
              </div>
              <div className="obras-form-field">
                <label>Status</label>
                <select
                  className="obras-select"
                  value={formData.status}
                  onChange={(e) => onChange("status", e.target.value)}
                >
                  <option value="nao-iniciado">Não Iniciado</option>
                  <option value="em-andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>
            </div>
            <div className="obras-form-field">
              <label>Responsável</label>
              <Input
                type="text"
                placeholder="Nome do responsável"
                value={formData.responsible}
                onChange={(value) => onChange("responsible", value)}
              />
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Custo Planejado (R$)</label>
                <Input
                  type="text"
                  placeholder="Custo planejado"
                  value={(formData.plannedCost * 100).toString()}
                  onChange={(value) =>
                    onChange("plannedCost", (parseFloat(value) || 0) / 100)
                  }
                  mask="currency"
                  min={0}
                />
              </div>
              <div className="obras-form-field">
                <label>Custo Real (R$)</label>
                <Input
                  type="text"
                  placeholder="Custo real"
                  value={(formData.actualCost * 100).toString()}
                  onChange={(value) =>
                    onChange("actualCost", (parseFloat(value) || 0) / 100)
                  }
                  mask="currency"
                  min={0}
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
              {editingItem ? "Atualizar Tarefa" : "Salvar Tarefa"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

