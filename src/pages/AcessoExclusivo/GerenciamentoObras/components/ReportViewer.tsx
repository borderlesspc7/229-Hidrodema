import { useRef, useState } from "react";
import Card from "../../../../components/ui/Card/Card";
import Button from "../../../../components/ui/Button/Button";
import type { ObraReport, Project } from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import type { User } from "../../../../types/user";
import ReportTypeBadge from "./ReportTypeBadge";
import { FiArrowLeft, FiLock, FiPaperclip, FiTrash2, FiUnlock } from "react-icons/fi";
import { exportObraReportToPdf } from "../../../../lib/obrasReportPdf";
import { canEditReport, isReportFinalized } from "../../../../lib/reportPermissions";
import { uploadReportAttachment, deleteReportAttachment } from "../../../../services/obrasReportAttachmentsService";

type Props = {
  report: ObraReport;
  projects: Project[];
  user: User | null;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
  onBack: () => void;
  onFinalize: () => void;
  onUnlockAdmin: () => void;
  onUpdateReport: (id: string, updates: Partial<Omit<ObraReport, "id" | "createdAt">>) => void | Promise<void>;
};

export default function ReportViewer({
  report,
  projects,
  user,
  onBack,
  onFinalize,
  onUnlockAdmin,
  onUpdateReport,
}: Props) {
  const project = projects.find((p) => p.id === report.projectId);
  const finalized = isReportFinalized(report);
  const isAdmin = user?.role === "admin";
  const canMutate = !finalized || (user ? canEditReport(user, report) : false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

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

          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiPaperclip /> Anexos
            </h3>

            {report.attachments?.length ? (
              <div style={{ display: "grid", gap: 8 }}>
                {report.attachments.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.8)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
                        <a href={a.storageUrl} target="_blank" rel="noreferrer">
                          {a.name}
                        </a>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>
                        {(a.sizeBytes ? `${Math.round(a.sizeBytes / 1024)} KB` : "")}
                        {a.uploadedAt ? ` · ${new Date(a.uploadedAt).toLocaleString()}` : ""}
                      </div>
                    </div>
                    {canMutate ? (
                      <Button
                        variant="danger"
                        onClick={() =>
                          void (async () => {
                            if (!confirm("Remover este anexo?")) return;
                            try {
                              await deleteReportAttachment(a);
                            } finally {
                              const next = (report.attachments ?? []).filter((x) => x.id !== a.id);
                              await onUpdateReport(report.id, { attachments: next });
                            }
                          })()
                        }
                      >
                        <FiTrash2 size={16} /> Remover
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="obras-helper-text">Nenhum anexo neste relatório.</div>
            )}

            <input
              ref={fileRef}
              type="file"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                void (async () => {
                  try {
                    setUploading(true);
                    const attachment = await uploadReportAttachment({
                      projectId: report.projectId,
                      reportId: report.id,
                      file: f,
                      uploadedByEmail: user?.email ?? undefined,
                    });
                    const next = [...(report.attachments ?? []), attachment].sort(
                      (a, b) => new Date(b.uploadedAt ?? 0).getTime() - new Date(a.uploadedAt ?? 0).getTime()
                    );
                    await onUpdateReport(report.id, { attachments: next });
                  } catch (err) {
                    console.error(err);
                    alert("Não foi possível enviar o anexo. Verifique permissões do Storage.");
                  } finally {
                    setUploading(false);
                    if (fileRef.current) fileRef.current.value = "";
                  }
                })();
              }}
            />

            {canMutate ? (
              <div style={{ marginTop: 10 }}>
                <Button
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  <FiPaperclip size={16} /> {uploading ? "Enviando..." : "Adicionar anexo"}
                </Button>
              </div>
            ) : (
              <div className="obras-helper-text">
                Relatório finalizado: anexos só podem ser alterados por admin.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
