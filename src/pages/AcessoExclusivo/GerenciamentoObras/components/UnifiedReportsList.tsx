import { useMemo, useState } from "react";
import Button from "../../../../components/ui/Button/Button";
import Card from "../../../../components/ui/Card/Card";
import type {
  ObraReport,
  ObraReportType,
  Project,
} from "../../../../types/obrasGerenciamentoModule";
import ReportTypeBadge from "./ReportTypeBadge";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import {
  FiArrowLeft,
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiFileText,
} from "react-icons/fi";
import { exportObraReportToPdf } from "../../../../lib/obrasReportPdf";
import { canEditReport, isReportFinalized } from "../../../../lib/reportPermissions";
import type { User } from "../../../../types/user";

type Props = {
  user: User | null;
  projects: Project[];
  reports: ObraReport[];
  onOpenReport: (report: ObraReport) => void;
  onEditReport: (report: ObraReport) => void;
  onDeleteReport: (id: string) => void | Promise<void>;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function UnifiedReportsList({
  user,
  projects,
  reports,
  onOpenReport,
  onEditReport,
  onDeleteReport,
  setViewMode,
}: Props) {
  const [query, setQuery] = useState("");
  const [projectId, setProjectId] = useState("");
  const [type, setType] = useState<ObraReportType | "">("");
  const [sortBy, setSortBy] = useState<"date" | "createdAt">("date");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...reports]
      .filter((r) => (!projectId ? true : r.projectId === projectId))
      .filter((r) => (!type ? true : r.type === type))
      .filter((r) => {
        if (!q) return true;
        const project = projects.find((p) => p.id === r.projectId)?.name ?? "";
        return (
          project.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.date.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const ka = sortBy === "date" ? a.date : a.createdAt;
        const kb = sortBy === "date" ? b.date : b.createdAt;
        return new Date(kb).getTime() - new Date(ka).getTime();
      });
  }, [projectId, projects, query, reports, sortBy, type]);

  const counts = useMemo(() => {
    const base = !projectId ? reports : reports.filter((r) => r.projectId === projectId);
    return {
      total: base.length,
      rdo: base.filter((r) => r.type === "rdo").length,
      expense: base.filter((r) => r.type === "expense").length,
      hydrostatic: base.filter((r) => r.type === "hydrostatic-test").length,
      completion: base.filter((r) => r.type === "project-completion").length,
    };
  }, [projectId, reports]);

  return (
    <div className="obras-unified-container">
      <div className="obras-unified-header">
        <div>
          <div className="obras-unified-kicker">GERENCIAMENTO DE OBRAS</div>
          <h2 className="obras-unified-title">RELATÓRIOS UNIFICADOS</h2>
          <p className="obras-unified-subtitle">Todos os relatórios criados em um único lugar</p>
        </div>

        <div className="obras-unified-actions">
          <Button variant="primary" onClick={() => setViewMode("reports-select")}>
            <FiPlus size={16} />
            Novo Relatório
          </Button>
          <Button variant="secondary" onClick={() => setViewMode("reports")}>
            <FiArrowLeft size={16} />
            Voltar
          </Button>
        </div>
      </div>

      <div className="obras-unified-stats">
        <div className="obras-unified-stat">
          <div className="obras-unified-stat__num">{counts.total}</div>
          <div className="obras-unified-stat__label">Total de relatórios</div>
        </div>
        <div className="obras-unified-stat">
          <div className="obras-unified-stat__num">{counts.rdo}</div>
          <div className="obras-unified-stat__label">RDOs</div>
        </div>
        <div className="obras-unified-stat">
          <div className="obras-unified-stat__num">{counts.expense}</div>
          <div className="obras-unified-stat__label">Gastos</div>
        </div>
        <div className="obras-unified-stat">
          <div className="obras-unified-stat__num">{counts.hydrostatic}</div>
          <div className="obras-unified-stat__label">Testes hidrostáticos</div>
        </div>
        <div className="obras-unified-stat">
          <div className="obras-unified-stat__num">{counts.completion}</div>
          <div className="obras-unified-stat__label">Conclusões</div>
        </div>
      </div>

      <div className="obras-unified-filters">
        <div className="obras-unified-search">
          <FiSearch />
          <input
            className="obras-unified-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome da obra ou num…"
          />
        </div>

        <div className="obras-unified-filter">
          <label>Tipo:</label>
          <select
            className="obras-unified-select"
            value={type}
            onChange={(e) => setType(e.target.value as ObraReportType | "")}
          >
            <option value="">Todos os tipos</option>
            <option value="rdo">RDO</option>
            <option value="expense">Gasto</option>
            <option value="hydrostatic-test">Teste</option>
            <option value="project-completion">Conclusão</option>
          </select>
        </div>

        <div className="obras-unified-filter">
          <label>Obra:</label>
          <select
            className="obras-unified-select"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Todas as obras</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="obras-unified-filter">
          <label>Ordenar por:</label>
          <select
            className="obras-unified-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="date">Data</option>
            <option value="createdAt">Criado em</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="obras-empty-state">
          <h3>Nenhum relatório encontrado</h3>
          <p>Ajuste os filtros ou crie um novo relatório.</p>
        </div>
      ) : (
        <div className="obras-unified-list">
          {filtered.slice(0, 200).map((r) => {
            const project = projects.find((p) => p.id === r.projectId);
            const finalized = isReportFinalized(r);
            const editable = user ? canEditReport(user, r) : false;
            const statusLabel = finalized ? "Finalizado" : "Pendente";

            return (
              <Card
                key={r.id}
                variant="technology"
                className="obras-unified-item"
                title=""
                textColor="#e2e8f0"
              >
                <div className="obras-unified-item__main">
                  <div className="obras-unified-item__meta">
                    <div className="obras-unified-item__title">
                      <FiFileText />
                      <span className="obras-unified-item__project">
                        {project?.name ?? "Obra não encontrada"}
                      </span>
                      <ReportTypeBadge type={r.type} />
                      <span
                        className={
                          "obras-unified-status " +
                          (finalized ? "obras-unified-status--final" : "obras-unified-status--pending")
                        }
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="obras-unified-item__sub">
                      <span>{new Date(r.date).toLocaleDateString()}</span>
                      <span aria-hidden="true">•</span>
                      <span>Criado em {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="obras-unified-item__actions">
                    <Button variant="primary" onClick={() => onOpenReport(r)}>
                      <FiEye size={16} />
                      Visualizar
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() =>
                        void exportObraReportToPdf(r, project).catch(() =>
                          alert("Não foi possível gerar o PDF (verifique rede e fotos na nuvem).")
                        )
                      }
                    >
                      PDF
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => editable && onEditReport(r)}
                      disabled={!editable}
                      title={
                        editable
                          ? "Editar"
                          : "Relatório finalizado — só administradores podem editar."
                      }
                    >
                      <FiEdit3 size={16} />
                      Editar
                    </Button>

                    <Button variant="danger" onClick={() => void onDeleteReport(r.id)}>
                      <FiTrash2 size={16} />
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

