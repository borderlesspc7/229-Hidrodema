import Button from "../../../../../components/ui/Button/Button";
import {
  FiArrowLeft,
  FiTrendingUp,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiTool,
  FiPackage,
  FiUsers,
  FiShield,
  FiFileText,
  FiTruck,
} from "react-icons/fi";
import type {
  Project,
  DiaryEntry,
  InventoryItem,
  Budget,
  Supplier,
  QualityChecklist,
  TeamMember,
  Equipment,
  Schedule,
  SafetyRecord,
  Measurement,
  Issue,
  DocumentRecord,
} from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";

interface ReportsDashboardProps {
  projects: Project[];
  diaryEntries: DiaryEntry[];
  inventory: InventoryItem[];
  budgets: Budget[];
  suppliers: Supplier[];
  qualityChecklists: QualityChecklist[];
  teamMembers: TeamMember[];
  equipment: Equipment[];
  schedules: Schedule[];
  safetyRecords: SafetyRecord[];
  measurements: Measurement[];
  issues: Issue[];
  documents: DocumentRecord[];
  onViewChange: (mode: ViewMode) => void;
}

export default function ReportsDashboard({
  projects,
  diaryEntries,
  inventory,
  budgets,
  suppliers,
  qualityChecklists,
  teamMembers,
  equipment,
  schedules,
  safetyRecords,
  measurements,
  issues,
  documents,
  onViewChange,
}: ReportsDashboardProps) {
  // Calcular estatísticas dos projetos
  const totalBudget = budgets.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  const budgetRemaining = totalBudget - totalSpent;

  // Projetos por status
  const activeProjects = projects.filter(
    (p) => p.status === "em-andamento"
  ).length;
  const completedProjects = projects.filter(
    (p) => p.status === "concluida"
  ).length;
  const plannedProjects = projects.filter(
    (p) => p.status === "planejamento"
  ).length;

  // Progresso médio dos projetos
  const averageProgress =
    projects.length > 0
      ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
      : 0;

  // Estoque baixo
  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.minStock
  ).length;

  // Equipamentos por status
  const availableEquipment = equipment.filter(
    (e) => e.status === "disponivel"
  ).length;
  const inUseEquipment = equipment.filter((e) => e.status === "em-uso").length;
  const maintenanceEquipment = equipment.filter(
    (e) => e.status === "manutencao"
  ).length;

  // Problemas por prioridade
  const openIssues = issues.filter((i) => i.status === "aberto").length;
  const criticalIssues = issues.filter(
    (i) => i.priority === "critica" && i.status !== "resolvido"
  ).length;

  // Registros de segurança recentes
  const pendingSafetyRecords = safetyRecords.filter(
    (r) => r.status === "pendente"
  ).length;

  // Tarefas do cronograma
  const notStartedTasks = schedules.filter(
    (s) => s.status === "nao-iniciado"
  ).length;
  const inProgressTasks = schedules.filter(
    (s) => s.status === "em-andamento"
  ).length;
  const completedTasks = schedules.filter((s) => s.status === "concluido").length;
  const delayedTasks = schedules.filter((s) => s.status === "atrasado").length;

  // Qualidade
  const completedChecklists = qualityChecklists.filter(
    (q) => q.status === "concluida"
  ).length;
  const pendingChecklists = qualityChecklists.filter(
    (q) => q.status === "pendente"
  ).length;

  return (
    <div className="obras-reports-container">
      <div className="obras-reports-header">
        <h2>RELATÓRIOS E ANÁLISES</h2>
        <Button
          variant="primary"
          onClick={() => onViewChange("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-reports-dashboard">
        {/* Resumo Geral de Projetos */}
        <div className="obras-dashboard-section">
          <h3 className="obras-dashboard-section-title">
            <FiTrendingUp size={24} /> Resumo de Projetos
          </h3>
          <div className="obras-dashboard-cards">
            <div className="obras-dashboard-card obras-card-primary">
              <div className="obras-card-icon">
                <FiTool size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Total de Obras</h4>
                <p className="obras-card-value">{projects.length}</p>
                <span className="obras-card-detail">
                  {activeProjects} em andamento
                </span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-success">
              <div className="obras-card-icon">
                <FiCheckCircle size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Concluídas</h4>
                <p className="obras-card-value">{completedProjects}</p>
                <span className="obras-card-detail">
                  {plannedProjects} em planejamento
                </span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-info">
              <div className="obras-card-icon">
                <FiClock size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Progresso Médio</h4>
                <p className="obras-card-value">{averageProgress.toFixed(1)}%</p>
                <div className="obras-progress-bar">
                  <div
                    className="obras-progress-fill"
                    style={{ width: `${averageProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-warning">
              <div className="obras-card-icon">
                <FiFileText size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Registros de Diário</h4>
                <p className="obras-card-value">{diaryEntries.length}</p>
                <span className="obras-card-detail">Lançamentos totais</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="obras-dashboard-section">
          <h3 className="obras-dashboard-section-title">
            <FiDollarSign size={24} /> Resumo Financeiro
          </h3>
          <div className="obras-dashboard-cards">
            <div className="obras-dashboard-card obras-card-primary">
              <div className="obras-card-icon">
                <FiDollarSign size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Orçamento Total</h4>
                <p className="obras-card-value">
                  R$ {totalBudget.toLocaleString("pt-BR")}
                </p>
                <span className="obras-card-detail">{budgets.length} orçamentos</span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-danger">
              <div className="obras-card-icon">
                <FiTrendingUp size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Total Gasto</h4>
                <p className="obras-card-value">
                  R$ {totalSpent.toLocaleString("pt-BR")}
                </p>
                <span className="obras-card-detail">
                  {((totalSpent / totalBudget) * 100 || 0).toFixed(1)}% utilizado
                </span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-success">
              <div className="obras-card-icon">
                <FiCheckCircle size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Saldo Disponível</h4>
                <p className="obras-card-value">
                  R$ {budgetRemaining.toLocaleString("pt-BR")}
                </p>
                <span className="obras-card-detail">
                  {((budgetRemaining / totalBudget) * 100 || 0).toFixed(1)}%
                  restante
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recursos e Operacional */}
        <div className="obras-dashboard-section">
          <h3 className="obras-dashboard-section-title">
            <FiPackage size={24} /> Recursos e Operacional
          </h3>
          <div className="obras-dashboard-cards">
            <div className="obras-dashboard-card obras-card-warning">
              <div className="obras-card-icon">
                <FiPackage size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Estoque</h4>
                <p className="obras-card-value">{inventory.length}</p>
                <span
                  className="obras-card-detail"
                  style={{ color: lowStockItems > 0 ? "#ef4444" : "#10b981" }}
                >
                  {lowStockItems > 0
                    ? `${lowStockItems} itens em falta`
                    : "Estoque OK"}
                </span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-info">
              <div className="obras-card-icon">
                <FiTool size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Equipamentos</h4>
                <p className="obras-card-value">{equipment.length}</p>
                <span className="obras-card-detail">
                  {availableEquipment} disponíveis, {inUseEquipment} em uso
                </span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-primary">
              <div className="obras-card-icon">
                <FiUsers size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Equipe</h4>
                <p className="obras-card-value">{teamMembers.length}</p>
                <span className="obras-card-detail">Membros cadastrados</span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-info">
              <div className="obras-card-icon">
                <FiTruck size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Fornecedores</h4>
                <p className="obras-card-value">{suppliers.length}</p>
                <span className="obras-card-detail">Parceiros ativos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cronograma e Tarefas */}
        <div className="obras-dashboard-section">
          <h3 className="obras-dashboard-section-title">
            <FiClock size={24} /> Cronograma e Tarefas
          </h3>
          <div className="obras-dashboard-cards">
            <div className="obras-dashboard-card obras-card-primary">
              <div className="obras-card-icon">
                <FiClock size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Total de Tarefas</h4>
                <p className="obras-card-value">{schedules.length}</p>
                <span className="obras-card-detail">
                  {completedTasks} concluídas
                </span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-info">
              <div className="obras-card-icon">
                <FiCheckCircle size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Em Andamento</h4>
                <p className="obras-card-value">{inProgressTasks}</p>
                <span className="obras-card-detail">
                  {notStartedTasks} não iniciadas
                </span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-danger">
              <div className="obras-card-icon">
                <FiAlertCircle size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Atrasadas</h4>
                <p className="obras-card-value">{delayedTasks}</p>
                <span className="obras-card-detail">Requerem atenção</span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-warning">
              <div className="obras-card-icon">
                <FiCheckCircle size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Medições</h4>
                <p className="obras-card-value">{measurements.length}</p>
                <span className="obras-card-detail">Registradas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Qualidade e Segurança */}
        <div className="obras-dashboard-section">
          <h3 className="obras-dashboard-section-title">
            <FiShield size={24} /> Qualidade e Segurança
          </h3>
          <div className="obras-dashboard-cards">
            <div className="obras-dashboard-card obras-card-success">
              <div className="obras-card-icon">
                <FiCheckCircle size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Checklists de Qualidade</h4>
                <p className="obras-card-value">{qualityChecklists.length}</p>
                <span className="obras-card-detail">
                  {completedChecklists} concluídos, {pendingChecklists} pendentes
                </span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-info">
              <div className="obras-card-icon">
                <FiShield size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Registros de Segurança</h4>
                <p className="obras-card-value">{safetyRecords.length}</p>
                <span className="obras-card-detail">
                  {pendingSafetyRecords} pendentes
                </span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-danger">
              <div className="obras-card-icon">
                <FiAlertCircle size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Problemas Abertos</h4>
                <p className="obras-card-value">{openIssues}</p>
                <span
                  className="obras-card-detail"
                  style={{
                    color: criticalIssues > 0 ? "#ef4444" : "#10b981",
                  }}
                >
                  {criticalIssues > 0
                    ? `${criticalIssues} críticos`
                    : "Sem problemas críticos"}
                </span>
              </div>
            </div>

            <div className="obras-dashboard-card obras-card-primary">
              <div className="obras-card-icon">
                <FiFileText size={48} />
              </div>
              <div className="obras-card-content">
                <h4>Documentos</h4>
                <p className="obras-card-value">{documents.length}</p>
                <span className="obras-card-detail">Arquivados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

