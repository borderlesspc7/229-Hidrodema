import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/ui/Button/Button";
import Card from "../../../../components/ui/Card/Card";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import type { DiaryEntry, InventoryItem, ObraReport, Photo, Project, Supplier } from "../../../../types/obrasGerenciamentoModule";
import { getPhotoSrc } from "../../../../lib/photoDisplay";
import ReportTypeBadge from "./ReportTypeBadge";
import { FiArrowLeft, FiBarChart2, FiCamera, FiClipboard, FiDollarSign, FiFileText, FiTrendingUp, FiUsers } from "react-icons/fi";
import { listDocumentosByProject, type ObraDocumentoMeta } from "../../../../services/obrasDocumentosService";
import { paths } from "../../../../routes/paths";

type Props = {
  project: Project;
  diaryEntries: DiaryEntry[];
  reports: ObraReport[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  onOpenReport: (report: ObraReport) => void;
  onPrintProject: () => void;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

function StatCard({
  title,
  value,
  Icon,
  gradient,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
  Icon: React.ComponentType<{ size?: number }>;
  gradient: string;
}) {
  return (
    <div className="obras-dashboard-card">
      <div className="obras-card-icon" style={{ background: gradient }}>
        <Icon size={32} />
      </div>
      <div className="obras-card-content">
        <h3>{title}</h3>
        <p className="obras-card-number">{value}</p>
        <p className="obras-card-label">{subtitle ?? " "}</p>
      </div>
    </div>
  );
}

export default function ProjectOverview({
  project,
  diaryEntries,
  reports,
  inventory,
  suppliers,
  onOpenReport,
  onPrintProject,
  setViewMode,
}: Props) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<ObraDocumentoMeta[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const projectReports = useMemo(
    () => reports.filter((r) => r.projectId === project.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [project.id, reports]
  );

  const projectDiaries = useMemo(
    () => diaryEntries.filter((d) => d.projectId === project.id),
    [diaryEntries, project.id]
  );

  const photoGallery = useMemo(() => {
    const fromDiaries = projectDiaries.flatMap((d) =>
      (d.photos ?? []).map((p) => ({
        id: `diary-${d.id}-${p.id}`,
        name: p.name,
        description: p.description,
        src: getPhotoSrc(p as Photo),
        createdAt: d.createdAt,
        source: "Diário",
      }))
    );
    const fromRdos = projectReports
      .filter((r) => r.type === "rdo")
      .flatMap((r) =>
        (r.photos ?? []).map((p) => ({
          id: `rdo-${r.id}-${p.id}`,
          name: p.name,
          description: p.description,
          src: getPhotoSrc(p as Photo),
          createdAt: r.createdAt,
          source: "RDO",
        }))
      );
    return [...fromDiaries, ...fromRdos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [projectDiaries, projectReports]);

  useEffect(() => {
    let alive = true;
    setDocsLoading(true);
    void (async () => {
      try {
        const list = await listDocumentosByProject(project.id);
        if (!alive) return;
        setDocs(list);
      } catch {
        if (!alive) return;
        setDocs([]);
      } finally {
        if (!alive) return;
        setDocsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [project.id]);

  const photosCount = useMemo(() => {
    const fromDiaries = projectDiaries.reduce((acc, d) => acc + (d.photos?.length ?? 0), 0);
    const fromRdos = projectReports
      .filter((r) => r.type === "rdo")
      .reduce((acc, r) => acc + (r.photos?.length ?? 0), 0);
    return fromDiaries + fromRdos;
  }, [projectDiaries, projectReports]);

  const teamCount = (project.team?.length ?? 0) + (project.labor ? 1 : 0);
  const tasksTotal = project.milestones?.length ?? 0;
  const tasksDone = (project.milestones ?? []).filter((m) => m.status === "concluida").length;
  const tasksPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  const spent = project.spent ?? 0;
  const budget = project.budget ?? 0;
  const remaining = Math.max(0, budget - spent);
  const budgetPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  const durationDays = useMemo(() => {
    if (!project.startDate || !project.endDate) return null;
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }, [project.endDate, project.startDate]);

  const suppliersCount = suppliers.filter((s) => s.projectId === project.id).length;
  const inventoryCount = inventory.filter((i) => i.projectId === project.id).length;
  const inventoryValue = inventory
    .filter((i) => i.projectId === project.id)
    .reduce((acc, i) => acc + i.quantity * i.price, 0);

  const rdoCount = projectReports.filter((r) => r.type === "rdo").length;
  const expenseCount = projectReports.filter((r) => r.type === "expense").length;
  const totalExpense = projectReports
    .filter((r) => r.type === "expense")
    .reduce((acc, r) => acc + (r.amount ?? 0), 0);

  const reportDetails = useMemo(() => {
    return projectReports.map((r) => {
      const date = "date" in r ? r.date : "";
      const photos = r.type === "rdo" ? r.photos?.length ?? 0 : 0;
      const activities =
        r.type === "rdo"
          ? r.activities
          : r.type === "project-completion"
            ? r.summary
            : r.type === "expense"
              ? r.description
              : `Pressão: ${r.pressure} bar / Tempo: ${r.durationMinutes} min`;
      const observations =
        r.type === "rdo"
          ? r.observations
          : r.type === "expense"
            ? r.notes
            : r.type === "hydrostatic-test"
              ? r.notes
              : r.pendingItems;
      return { r, date, photos, activities, observations };
    });
  }, [projectReports]);

  return (
    <div className="obras-reports-container">
      <div className="obras-reports-header">
        <h2>Overview da Obra</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={onPrintProject} className="obras-back-to-menu">
            Imprimir obra
          </Button>
          <Button
            variant="primary"
            onClick={() => setViewMode("projects")}
            className="obras-back-to-menu"
          >
            <FiArrowLeft size={16} />
            Voltar às Obras
          </Button>
        </div>
      </div>

      <div className="obras-reports-dashboard">
        <div className="obras-dashboard-cards">
          <StatCard
            title="Relatórios gerados"
            value={String(projectReports.length)}
            subtitle="Total"
            Icon={FiFileText}
            gradient="linear-gradient(135deg, #7c3aed, #4c1d95)"
          />
          <StatCard
            title="Progresso geral"
            value={`${project.progress ?? 0}%`}
            subtitle="Obra"
            Icon={FiTrendingUp}
            gradient="linear-gradient(135deg, #3b82f6, #1e40af)"
          />
          <StatCard
            title="Gasto acumulado"
            value={`R$ ${spent.toLocaleString()}`}
            subtitle="Financeiro"
            Icon={FiDollarSign}
            gradient="linear-gradient(135deg, #ea580c, #9a3412)"
          />
          <StatCard
            title="Equipe alocada"
            value={String(teamCount)}
            subtitle="Membros/registro"
            Icon={FiUsers}
            gradient="linear-gradient(135deg, #10b981, #065f46)"
          />
          <StatCard
            title="Fotos registradas"
            value={String(photosCount)}
            subtitle="Diário + RDO"
            Icon={FiCamera}
            gradient="linear-gradient(135deg, #0ea5e9, #0369a1)"
          />
          <StatCard
            title="Tarefas no cronograma"
            value={`${tasksDone}/${tasksTotal}`}
            subtitle={`${tasksPct}% concluído`}
            Icon={FiClipboard}
            gradient="linear-gradient(135deg, #f59e0b, #92400e)"
          />
        </div>

        <Card variant="service" className="obras-form-card" title="" textColor="#1e293b">
          <div className="obras-form-header">
            <h2 className="obras-form-title">{project.name}</h2>
            <p className="obras-form-subtitle">Informações rápidas da obra</p>
          </div>
          <div className="obras-form-content">
            <div className="obras-section">
              <h3 className="obras-section-title">
                <FiBarChart2 /> Contexto
              </h3>
              <div className="obras-project-info">
                <p><strong>Cliente:</strong> {project.client}</p>
                <p><strong>Descrição:</strong> {project.description || "-"}</p>
                <p><strong>Mão de obra:</strong> {project.labor || "-"}</p>
                <p><strong>Status:</strong> {project.status}</p>
                <p><strong>Início:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}</p>
                <p><strong>Previsão:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : "-"}</p>
                <p><strong>Duração estimada:</strong> {durationDays === null ? "-" : `${durationDays} dias`}</p>
                <p><strong>Orçamento:</strong> R$ {budget.toLocaleString()}</p>
              </div>
            </div>

            <div className="obras-section">
              <h3 className="obras-section-title">
                <FiDollarSign /> Métricas financeiras
              </h3>
              <div className="obras-project-info">
                <p><strong>Gasto atual:</strong> R$ {spent.toLocaleString()}</p>
                <p><strong>Saldo restante:</strong> R$ {remaining.toLocaleString()}</p>
                <p><strong>Utilização do orçamento:</strong> {budgetPct}%</p>
              </div>
              <div className="obras-progress-bar" style={{ height: 10 }}>
                <div
                  className="obras-progress-fill"
                  style={{ width: `${budgetPct}%`, background: "linear-gradient(90deg, #ea580c, #9a3412)" }}
                />
              </div>
            </div>

            <div className="obras-section">
              <h3 className="obras-section-title">
                <FiClipboard /> Métricas de cronograma
              </h3>
              <div className="obras-project-info">
                <p><strong>Total de tarefas:</strong> {tasksTotal}</p>
                <p><strong>Concluídas:</strong> {tasksDone}</p>
                <p><strong>Taxa de conclusão:</strong> {tasksPct}%</p>
                <p><strong>Progresso geral:</strong> {project.progress ?? 0}%</p>
              </div>
            </div>

            <div className="obras-section">
              <h3 className="obras-section-title">
                <FiFileText /> Métricas de relatórios
              </h3>
              <div className="obras-project-info">
                <p><strong>Total:</strong> {projectReports.length}</p>
                <p><strong>RDOs:</strong> {rdoCount}</p>
                <p><strong>Lançamentos de gastos:</strong> {expenseCount}</p>
                <p><strong>Total de despesas:</strong> R$ {totalExpense.toLocaleString()}</p>
              </div>
            </div>

            <div className="obras-section">
              <h3 className="obras-section-title">
                <FiUsers /> Recursos alocados (resumo)
              </h3>
              <div className="obras-project-info">
                <p><strong>Itens de estoque vinculados:</strong> {inventoryCount}</p>
                <p><strong>Valor de estoque vinculado:</strong> R$ {inventoryValue.toLocaleString()}</p>
                <p><strong>Fornecedores relacionados:</strong> {suppliersCount}</p>
              </div>
            </div>

            <div className="obras-section">
              <h3 className="obras-section-title">
                <FiUsers /> Equipe
              </h3>
              {project.team?.length ? (
                <div className="obras-tags">
                  {project.team.map((name) => (
                    <span key={name} className="obras-tag">
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="obras-quality-info">
                  <p>Nenhum membro listado em equipe.</p>
                </div>
              )}
            </div>
          </div>

          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiFileText /> Anexos (Documentos)
            </h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(`${paths.obras.documentos}?projectId=${encodeURIComponent(project.id)}`)
                }
              >
                Adicionar documento
              </Button>
            </div>
            {docsLoading ? (
              <div className="obras-helper-text">Carregando documentos…</div>
            ) : docs.length === 0 ? (
              <div className="obras-helper-text">Nenhum documento vinculado a esta obra.</div>
            ) : (
              <div className="obras-materials-list">
                <table className="obras-materials-table">
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th>Arquivo</th>
                      <th>Enviado em</th>
                      <th>Abrir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.slice(0, 20).map((d) => (
                      <tr key={d.id ?? d.storagePath}>
                        <td>{d.category}</td>
                        <td>{d.fileName}</td>
                        <td>{new Date(d.uploadedAt).toLocaleString()}</td>
                        <td>
                          <a href={d.downloadUrl} target="_blank" rel="noreferrer">
                            Ver
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {docs.length > 20 ? (
                  <div className="obras-helper-text">
                    Mostrando 20 de {docs.length}. (Para upload/edição, use o módulo de Documentos.)
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </Card>

        <div className="obras-section" style={{ marginTop: 6 }}>
          <h3 className="obras-section-title">
            <FiFileText /> Relatórios da obra (cronológico + detalhes)
          </h3>
          {projectReports.length === 0 ? (
            <div className="obras-empty-state">
              <h3>Nenhum relatório vinculado</h3>
              <p>Gere relatórios para esta obra para montar o histórico.</p>
            </div>
          ) : (
            <div className="obras-materials-list">
              <table className="obras-materials-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Atividades / Conteúdo</th>
                    <th>Observações</th>
                    <th>Fotos</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {reportDetails.map(({ r, date, photos, activities, observations }) => (
                    <tr key={r.id}>
                      <td><ReportTypeBadge type={r.type} /></td>
                      <td>{date ? new Date(date).toLocaleDateString() : "-"}</td>
                      <td style={{ maxWidth: 360 }}>
                        <span className="obras-cell-truncate" title={activities || ""}>
                          {activities || "-"}
                        </span>
                      </td>
                      <td style={{ maxWidth: 360 }}>
                        <span className="obras-cell-truncate" title={observations || ""}>
                          {observations || "-"}
                        </span>
                      </td>
                      <td>{photos}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td>
                        <Button variant="secondary" onClick={() => onOpenReport(r)} className="obras-remove-btn">
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="obras-section" style={{ marginTop: 6 }}>
          <h3 className="obras-section-title">
            <FiCamera /> Galeria de fotos da obra
          </h3>
          {photoGallery.length === 0 ? (
            <div className="obras-empty-state">
              <h3>Nenhuma foto registrada</h3>
              <p>Adicione fotos no Diário ou em um RDO para montar a galeria.</p>
            </div>
          ) : (
            <div className="obras-photo-gallery">
              {photoGallery.map((p) => (
                <div key={p.id} className="obras-photo-card">
                  <div className="obras-photo-thumb">
                    <img src={p.src} alt={p.name} />
                  </div>
                  <div className="obras-photo-meta">
                    <div className="obras-photo-title" title={p.name}>
                      {p.name}
                    </div>
                    <div className="obras-photo-desc" title={p.description}>
                      {p.description || "Sem descrição"}
                    </div>
                    <div className="obras-photo-foot">
                      <span className="obras-report-type">{p.source}</span>
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

