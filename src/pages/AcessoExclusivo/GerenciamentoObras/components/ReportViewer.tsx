import Card from "../../../../components/ui/Card/Card";
import Button from "../../../../components/ui/Button/Button";
import type { ObraReport, Project } from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import type { User } from "../../../../types/user";
import ReportTypeBadge from "./ReportTypeBadge";
import { FiArrowLeft, FiLock, FiUnlock } from "react-icons/fi";
import { exportObraReportToPdf } from "../../../../lib/obrasReportPdf";
import { isReportFinalized } from "../../../../lib/reportPermissions";

type Props = {
  report: ObraReport;
  projects: Project[];
  user: User | null;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
  onBack: () => void;
  onFinalize: () => void;
  onUnlockAdmin: () => void;
};

export default function ReportViewer({
  report,
  projects,
  user,
  onBack,
  onFinalize,
  onUnlockAdmin,
}: Props) {
  const project = projects.find((p) => p.id === report.projectId);
  const finalized = isReportFinalized(report);
  const isAdmin = user?.role === "admin";

  return (
    <div className="obras-form-container">
      <Card variant="service" className="obras-form-card" title="" textColor="#1e293b">
        <div className="obras-form-header">
          <h2 className="obras-form-title">
            <ReportTypeBadge type={report.type} /> {project?.name ?? "Obra"}
          </h2>
          <p className="obras-form-subtitle">
            {report.reportNumber ? (
              <>
                <strong>Nº:</strong> {report.reportNumber} &nbsp;·&nbsp;
              </>
            ) : null}
            <strong>Data:</strong> {new Date(report.date).toLocaleDateString()}
            {finalized ? (
              <>
                {" "}
                &nbsp;·&nbsp; <FiLock size={14} style={{ verticalAlign: "middle" }} />{" "}
                <strong>Finalizado</strong>
                {report.finalizedAt ? (
                  <span style={{ fontWeight: 400 }}>
                    {" "}
                    ({new Date(report.finalizedAt).toLocaleString()})
                  </span>
                ) : null}
              </>
            ) : null}
          </p>
          <div className="obras-form-actions" style={{ marginTop: 12, flexWrap: "wrap", gap: 8 }}>
            <Button variant="secondary" onClick={onBack} className="obras-action-btn">
              <FiArrowLeft size={16} />
              Voltar
            </Button>
            {!finalized ? (
              <Button variant="secondary" onClick={onFinalize} className="obras-action-btn">
                <FiLock size={16} />
                Finalizar relatório
              </Button>
            ) : isAdmin ? (
              <Button variant="secondary" onClick={onUnlockAdmin} className="obras-action-btn">
                <FiUnlock size={16} />
                Reabrir edição (admin)
              </Button>
            ) : null}
            <Button
              variant="primary"
              onClick={() =>
                void exportObraReportToPdf(report, project).catch(() =>
                  alert(
                    "Não foi possível gerar o PDF (verifique rede e fotos na nuvem)."
                  )
                )
              }
              className="obras-action-btn"
            >
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="obras-form-content">
          {report.type === "rdo" ? (
            <>
              <div className="obras-section">
                <h3 className="obras-section-title">Atividades</h3>
                <div style={{ whiteSpace: "pre-wrap" }}>{report.activities}</div>
              </div>
              {report.observations ? (
                <div className="obras-section">
                  <h3 className="obras-section-title">Observações</h3>
                  <div style={{ whiteSpace: "pre-wrap" }}>{report.observations}</div>
                </div>
              ) : null}
            </>
          ) : null}

          {report.type === "expense" ? (
            <div className="obras-section">
              <h3 className="obras-section-title">Despesa</h3>
              <p>
                <strong>Categoria:</strong> {report.category}
              </p>
              <p>
                <strong>Descrição:</strong> {report.description}
              </p>
              <p>
                <strong>Valor:</strong> R$ {report.amount.toLocaleString()}
              </p>
              {report.notes ? (
                <p>
                  <strong>Obs:</strong> {report.notes}
                </p>
              ) : null}
            </div>
          ) : null}

          {report.type === "hydrostatic-test" ? (
            <div className="obras-section">
              <h3 className="obras-section-title">Teste Hidrostático</h3>
              <p>
                <strong>Pressão:</strong> {report.pressure}
              </p>
              <p>
                <strong>Duração (min):</strong> {report.durationMinutes}
              </p>
              <p>
                <strong>Resultado:</strong> {report.result}
              </p>
              {report.notes ? (
                <p>
                  <strong>Obs:</strong> {report.notes}
                </p>
              ) : null}
            </div>
          ) : null}

          {report.type === "project-completion" ? (
            <div className="obras-section">
              <h3 className="obras-section-title">Conclusão</h3>
              <p>
                <strong>Status final:</strong> {report.finalStatus}
              </p>
              <div style={{ whiteSpace: "pre-wrap" }}>
                <strong>Resumo:</strong> {report.summary}
              </div>
              {report.pendingItems ? (
                <div style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>
                  <strong>Pendências:</strong> {report.pendingItems}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
