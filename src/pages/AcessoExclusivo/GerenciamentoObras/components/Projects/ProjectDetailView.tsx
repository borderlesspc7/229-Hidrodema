import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import {
  FiArrowLeft,
  FiBarChart2,
  FiFileText,
  FiImage,
  FiInfo,
  FiMessageSquare,
  FiPackage,
  FiUsers,
  FiTool,
  FiCalendar,
  FiShield,
  FiTrendingUp,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";
import type {
  Project,
  DiaryEntry,
  InventoryItem,
  Supplier,
  TeamMember,
  Equipment,
  Schedule,
  SafetyRecord,
} from "../../../../../services/obrasService";

interface ProjectDetailViewProps {
  project: Project;
  diaryEntries: DiaryEntry[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  teamMembers: TeamMember[];
  equipment: Equipment[];
  schedules: Schedule[];
  safetyRecords: SafetyRecord[];
  onBack: () => void;
  onEditProject: (project: Project) => void;
}

type TabType =
  | "overview"
  | "metrics"
  | "reports"
  | "photos"
  | "info"
  | "comments"
  | "resources";

export default function ProjectDetailView({
  project,
  diaryEntries,
  inventory,
  suppliers,
  teamMembers,
  equipment,
  schedules,
  safetyRecords,
  onBack,
  onEditProject,
}: ProjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Filtrar dados relacionados a esta obra
  const projectReports = diaryEntries.filter(
    (entry) => entry.projectId === project.id
  );
  const projectInventory = inventory.filter(
    (item) => item.projectId === project.id
  );
  const projectSuppliers = suppliers.filter(
    (supplier) => supplier.projectId === project.id
  );
  const projectTeam = teamMembers.filter(
    (member) => member.projectId === project.id
  );
  const projectEquipment = equipment.filter(
    (equip) => equip.projectId === project.id
  );
  const projectSchedules = schedules.filter(
    (schedule) => schedule.projectId === project.id
  );
  const projectSafety = safetyRecords.filter(
    (safety) => safety.projectId === project.id
  );

  // Coletar todas as fotos dos relatórios
  const allPhotos = projectReports.flatMap((report) => report.photos || []);

  // Calcular métricas
  const totalReports = projectReports.length;
  const rdoReports = projectReports.filter((r) => r.reportType === "rdo").length;
  const expenseReports = projectReports.filter(
    (r) => r.reportType === "lancamento-gastos"
  ).length;
  const totalExpenses = projectReports
    .filter((r) => r.reportType === "lancamento-gastos")
    .reduce((sum, r) => {
      const expenses = r.expenses || [];
      return sum + expenses.reduce((s, e) => s + (e.value || 0), 0);
    }, 0);

  const completedTasks = projectSchedules.filter(
    (s) => s.status === "concluido"
  ).length;
  const totalTasks = projectSchedules.length;
  const taskCompletionRate =
    totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0";

  const budgetUtilization =
    project.budget > 0
      ? ((project.spent / project.budget) * 100).toFixed(1)
      : "0";

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: FiBarChart2 },
    { id: "metrics", label: "Métricas", icon: FiTrendingUp },
    { id: "reports", label: "Relatórios", icon: FiFileText },
    { id: "photos", label: "Fotos", icon: FiImage },
    { id: "info", label: "Informações", icon: FiInfo },
    { id: "resources", label: "Recursos", icon: FiPackage },
    { id: "comments", label: "Comentários", icon: FiMessageSquare },
  ];

  const renderOverview = () => (
    <div className="project-detail-overview">
      <div className="project-detail-stats-grid">
        <div className="project-detail-stat-card">
          <div className="project-detail-stat-icon" style={{ background: "#1e40af" }}>
            <FiFileText size={24} />
          </div>
          <div className="project-detail-stat-content">
            <h4>{totalReports}</h4>
            <p>Relatórios Totais</p>
          </div>
        </div>

        <div className="project-detail-stat-card">
          <div className="project-detail-stat-icon" style={{ background: "#10b981" }}>
            <FiCheckCircle size={24} />
          </div>
          <div className="project-detail-stat-content">
            <h4>{project.progress}%</h4>
            <p>Progresso da Obra</p>
          </div>
        </div>

        <div className="project-detail-stat-card">
          <div className="project-detail-stat-icon" style={{ background: "#f59e0b" }}>
            <FiDollarSign size={24} />
          </div>
          <div className="project-detail-stat-content">
            <h4>R$ {project.spent.toLocaleString("pt-BR")}</h4>
            <p>Gasto Total</p>
          </div>
        </div>

        <div className="project-detail-stat-card">
          <div className="project-detail-stat-icon" style={{ background: "#3b82f6" }}>
            <FiUsers size={24} />
          </div>
          <div className="project-detail-stat-content">
            <h4>{projectTeam.length}</h4>
            <p>Membros da Equipe</p>
          </div>
        </div>

        <div className="project-detail-stat-card">
          <div className="project-detail-stat-icon" style={{ background: "#8b5cf6" }}>
            <FiImage size={24} />
          </div>
          <div className="project-detail-stat-content">
            <h4>{allPhotos.length}</h4>
            <p>Fotos Registradas</p>
          </div>
        </div>

        <div className="project-detail-stat-card">
          <div className="project-detail-stat-icon" style={{ background: "#06b6d4" }}>
            <FiCalendar size={24} />
          </div>
          <div className="project-detail-stat-content">
            <h4>{totalTasks}</h4>
            <p>Tarefas no Cronograma</p>
          </div>
        </div>
      </div>

      <div className="project-detail-quick-info">
        <div className="project-detail-info-card">
          <h3>Informações Rápidas</h3>
          <div className="project-detail-info-list">
            <div className="project-detail-info-item">
              <span className="label">Cliente:</span>
              <span className="value">{project.client}</span>
            </div>
            <div className="project-detail-info-item">
              <span className="label">Status:</span>
              <span className={`status-badge status-${project.status}`}>
                {project.status === "planejamento"
                  ? "Planejamento"
                  : project.status === "em-andamento"
                  ? "Em Andamento"
                  : project.status === "concluida"
                  ? "Concluída"
                  : "Pausada"}
              </span>
            </div>
            <div className="project-detail-info-item">
              <span className="label">Data de Início:</span>
              <span className="value">
                {new Date(project.startDate).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="project-detail-info-item">
              <span className="label">Data de Término:</span>
              <span className="value">
                {new Date(project.endDate).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="project-detail-info-item">
              <span className="label">Orçamento:</span>
              <span className="value">
                R$ {project.budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="project-detail-info-item">
              <span className="label">Utilização do Orçamento:</span>
              <span className="value">{budgetUtilization}%</span>
            </div>
          </div>
        </div>

        <div className="project-detail-info-card">
          <h3>Recursos Alocados</h3>
          <div className="project-detail-resources-summary">
            <div className="resource-item">
              <FiPackage size={20} />
              <span>{projectInventory.length} Itens de Estoque</span>
            </div>
            <div className="resource-item">
              <FiTool size={20} />
              <span>{projectEquipment.length} Equipamentos</span>
            </div>
            <div className="resource-item">
              <FiUsers size={20} />
              <span>{projectSuppliers.length} Fornecedores</span>
            </div>
            <div className="resource-item">
              <FiShield size={20} />
              <span>{projectSafety.length} Registros de Segurança</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="project-detail-metrics">
      <div className="metrics-section">
        <h3>
          <FiDollarSign /> Métricas Financeiras
        </h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <label>Orçamento Total</label>
            <div className="metric-value">
              R$ {project.budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-card">
            <label>Gasto Atual</label>
            <div className="metric-value">
              R$ {project.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-card">
            <label>Saldo Restante</label>
            <div className="metric-value">
              R${" "}
              {(project.budget - project.spent).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="metric-card">
            <label>Utilização do Orçamento</label>
            <div className="metric-value">{budgetUtilization}%</div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{ width: `${budgetUtilization}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h3>
          <FiCalendar /> Métricas de Cronograma
        </h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <label>Tarefas Totais</label>
            <div className="metric-value">{totalTasks}</div>
          </div>
          <div className="metric-card">
            <label>Tarefas Concluídas</label>
            <div className="metric-value">{completedTasks}</div>
          </div>
          <div className="metric-card">
            <label>Taxa de Conclusão</label>
            <div className="metric-value">{taskCompletionRate}%</div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{ width: `${taskCompletionRate}%` }}
              ></div>
            </div>
          </div>
          <div className="metric-card">
            <label>Progresso da Obra</label>
            <div className="metric-value">{project.progress}%</div>
            <div className="metric-bar">
              <div
                className="metric-bar-fill"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h3>
          <FiFileText /> Métricas de Relatórios
        </h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <label>Total de Relatórios</label>
            <div className="metric-value">{totalReports}</div>
          </div>
          <div className="metric-card">
            <label>RDOs Criados</label>
            <div className="metric-value">{rdoReports}</div>
          </div>
          <div className="metric-card">
            <label>Lançamentos de Gastos</label>
            <div className="metric-value">{expenseReports}</div>
          </div>
          <div className="metric-card">
            <label>Total de Despesas Lançadas</label>
            <div className="metric-value">
              R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="project-detail-reports">
      <div className="reports-header">
        <h3>Relatórios da Obra ({projectReports.length})</h3>
      </div>
      {projectReports.length === 0 ? (
        <div className="empty-state">
          <FiFileText size={48} />
          <p>Nenhum relatório criado para esta obra</p>
        </div>
      ) : (
        <div className="reports-list">
          {projectReports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-info">
                  <h4>{report.obraName}</h4>
                  <span className="report-date">
                    {new Date(report.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <span className={`report-type-badge report-type-${report.reportType}`}>
                  {report.reportType === "rdo"
                    ? "RDO"
                    : report.reportType === "lancamento-gastos"
                    ? "Gastos"
                    : report.reportType === "teste-hidrostatico"
                    ? "Teste Hidrostático"
                    : "Conclusão"}
                </span>
              </div>
              <div className="report-content">
                {report.activities && (
                  <p>
                    <strong>Atividades:</strong> {report.activities}
                  </p>
                )}
                {report.observations && (
                  <p>
                    <strong>Observações:</strong> {report.observations}
                  </p>
                )}
                {report.photos && report.photos.length > 0 && (
                  <p>
                    <FiImage size={14} /> {report.photos.length} foto(s)
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPhotos = () => (
    <div className="project-detail-photos">
      <div className="photos-header">
        <h3>Galeria de Fotos ({allPhotos.length})</h3>
      </div>
      {allPhotos.length === 0 ? (
        <div className="empty-state">
          <FiImage size={48} />
          <p>Nenhuma foto registrada para esta obra</p>
        </div>
      ) : (
        <div className="photos-grid">
          {allPhotos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img src={photo.dataUrl} alt={photo.name} />
              <div className="photo-info">
                <h4>{photo.name}</h4>
                {photo.description && <p>{photo.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInfo = () => (
    <div className="project-detail-info">
      <div className="info-section">
        <h3>Informações Gerais</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Nome da Obra</label>
            <p>{project.name}</p>
          </div>
          <div className="info-item">
            <label>Cliente</label>
            <p>{project.client}</p>
          </div>
          <div className="info-item">
            <label>Descrição</label>
            <p>{project.description || "Sem descrição"}</p>
          </div>
          <div className="info-item">
            <label>Mão de Obra</label>
            <p>{project.labor || "Não informado"}</p>
          </div>
          <div className="info-item">
            <label>Status</label>
            <span className={`status-badge status-${project.status}`}>
              {project.status === "planejamento"
                ? "Planejamento"
                : project.status === "em-andamento"
                ? "Em Andamento"
                : project.status === "concluida"
                ? "Concluída"
                : "Pausada"}
            </span>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3>Datas e Prazos</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Data de Início</label>
            <p>{new Date(project.startDate).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="info-item">
            <label>Data de Término Prevista</label>
            <p>{new Date(project.endDate).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="info-item">
            <label>Duração Estimada</label>
            <p>
              {Math.ceil(
                (new Date(project.endDate).getTime() -
                  new Date(project.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              dias
            </p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3>Informações Financeiras</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Orçamento Total</label>
            <p>R$ {project.budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="info-item">
            <label>Valor Gasto</label>
            <p>R$ {project.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="info-item">
            <label>Saldo Disponível</label>
            <p>
              R${" "}
              {(project.budget - project.spent).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="project-detail-resources">
      <div className="resources-section">
        <h3>
          <FiUsers /> Equipe ({projectTeam.length})
        </h3>
        {projectTeam.length === 0 ? (
          <p className="empty-message">Nenhum membro da equipe alocado</p>
        ) : (
          <div className="resources-list">
            {projectTeam.map((member) => (
              <div key={member.id} className="resource-item-card">
                <h4>{member.name}</h4>
                <p>
                  <strong>Função:</strong> {member.role}
                </p>
                {member.phone && (
                  <p>
                    <strong>Telefone:</strong> {member.phone}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="resources-section">
        <h3>
          <FiTool /> Equipamentos ({projectEquipment.length})
        </h3>
        {projectEquipment.length === 0 ? (
          <p className="empty-message">Nenhum equipamento alocado</p>
        ) : (
          <div className="resources-list">
            {projectEquipment.map((equip) => (
              <div key={equip.id} className="resource-item-card">
                <h4>{equip.name}</h4>
                <p>
                  <strong>Tipo:</strong> {equip.type}
                </p>
                <span className={`status-badge status-${equip.status}`}>
                  {equip.status === "disponivel"
                    ? "Disponível"
                    : equip.status === "em-uso"
                    ? "Em Uso"
                    : equip.status === "manutencao"
                    ? "Manutenção"
                    : "Quebrado"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="resources-section">
        <h3>
          <FiPackage /> Estoque ({projectInventory.length})
        </h3>
        {projectInventory.length === 0 ? (
          <p className="empty-message">Nenhum item de estoque vinculado</p>
        ) : (
          <div className="resources-list">
            {projectInventory.map((item) => (
              <div key={item.id} className="resource-item-card">
                <h4>{item.name}</h4>
                <p>
                  <strong>Quantidade:</strong> {item.quantity} {item.unit}
                </p>
                <p>
                  <strong>Categoria:</strong> {item.category}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="resources-section">
        <h3>
          <FiDollarSign /> Fornecedores ({projectSuppliers.length})
        </h3>
        {projectSuppliers.length === 0 ? (
          <p className="empty-message">Nenhum fornecedor vinculado</p>
        ) : (
          <div className="resources-list">
            {projectSuppliers.map((supplier) => (
              <div key={supplier.id} className="resource-item-card">
                <h4>{supplier.name}</h4>
                <p>
                  <strong>Categoria:</strong> {supplier.category}
                </p>
                <p>
                  <strong>Contato:</strong> {supplier.contact}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderComments = () => {
    // Coletar todos os comentários dos relatórios
    const allComments = projectReports.flatMap((report) =>
      (report.comments || []).map((comment) => ({
        ...comment,
        reportDate: report.date,
        reportType: report.reportType,
      }))
    );

    return (
      <div className="project-detail-comments">
        <div className="comments-header">
          <h3>Comentários e Observações ({allComments.length})</h3>
        </div>
        {allComments.length === 0 ? (
          <div className="empty-state">
            <FiMessageSquare size={48} />
            <p>Nenhum comentário registrado para esta obra</p>
          </div>
        ) : (
          <div className="comments-list">
            {allComments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <strong>{comment.author}</strong>
                  <span className="comment-date">
                    {new Date(comment.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="project-detail-view">
      <div className="project-detail-header">
        <div className="project-detail-title-section">
          <Button
            variant="secondary"
            onClick={onBack}
            className="obras-back-btn"
          >
            <FiArrowLeft size={16} />
            Voltar
          </Button>
          <div className="project-detail-title">
            <h1>{project.name}</h1>
            <span className={`status-badge status-${project.status}`}>
              {project.status === "planejamento"
                ? "Planejamento"
                : project.status === "em-andamento"
                ? "Em Andamento"
                : project.status === "concluida"
                ? "Concluída"
                : "Pausada"}
            </span>
          </div>
        </div>
        <Button variant="primary" onClick={() => onEditProject(project)}>
          Editar Obra
        </Button>
      </div>

      <div className="project-detail-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`project-detail-tab ${
              activeTab === tab.id ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab.id as TabType)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="project-detail-content">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "metrics" && renderMetrics()}
        {activeTab === "reports" && renderReports()}
        {activeTab === "photos" && renderPhotos()}
        {activeTab === "info" && renderInfo()}
        {activeTab === "resources" && renderResources()}
        {activeTab === "comments" && renderComments()}
      </div>
    </div>
  );
}

