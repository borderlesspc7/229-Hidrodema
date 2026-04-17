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
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { exportObraReportToPdf } from "../../../../lib/obrasReportPdf";

type Props = {
  projects: Project[];
  reports: ObraReport[];
  onOpenReport: (report: ObraReport) => void;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function UnifiedReportsList({
  projects,
  reports,
  onOpenReport,
  setViewMode,
}: Props) {
  const [query, setQuery] = useState("");
  const [projectId, setProjectId] = useState("");
  const [type, setType] = useState<ObraReportType | "">("");

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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projectId, projects, query, reports, type]);

  return (
    <div className="obras-form-container">
      <Card variant="service" className="obras-form-card" title="" textColor="#1e293b">
        <div className="obras-form-header">
          <h2 className="obras-form-title">LISTA UNIFICADA DE RELATÓRIOS</h2>
          <div className="obras-form-actions" style={{ marginTop: 12 }}>
            <Button variant="secondary" onClick={() => setViewMode("reports")} className="obras-action-btn">
              <FiArrowLeft size={16} />
              Voltar
            </Button>
          </div>
        </div>

        <div className="obras-form-content">
          <div className="obras-form-row">
            <div className="obras-form-field obras-field-full">
              <label>Buscar</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <FiSearch />
                <input
                  className="obras-select"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Obra, tipo ou data..."
                />
              </div>
            </div>
          </div>

          <div className="obras-form-row">
            <div className="obras-form-field">
              <label>Obra</label>
              <select className="obras-select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Todas</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="obras-form-field">
              <label>Tipo</label>
              <select className="obras-select" value={type} onChange={(e) => setType(e.target.value as Props["reports"][number]["type"] | "")}>
                <option value="">Todos</option>
                <option value="rdo">RDO</option>
                <option value="expense">Despesa</option>
                <option value="hydrostatic-test">Teste Hidrostático</option>
                <option value="project-completion">Conclusão</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="obras-empty-state">
              <h3>Nenhum relatório encontrado</h3>
              <p>Ajuste os filtros ou crie um novo relatório.</p>
            </div>
          ) : (
            <div className="obras-materials-list">
              <table className="obras-materials-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Obra</th>
                    <th>Criado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map((r) => {
                    const project = projects.find((p) => p.id === r.projectId);
                    return (
                      <tr key={r.id}>
                        <td>
                          <ReportTypeBadge type={r.type} />
                        </td>
                        <td>{new Date(r.date).toLocaleDateString()}</td>
                        <td>{project?.name ?? "-"}</td>
                        <td>{new Date(r.createdAt).toLocaleString()}</td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <Button variant="primary" onClick={() => onOpenReport(r)}>
                              Ver
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() =>
                                void exportObraReportToPdf(r, project).catch(
                                  () =>
                                    alert(
                                      "Não foi possível gerar o PDF (verifique rede e fotos na nuvem)."
                                    )
                                )
                              }
                            >
                              PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

