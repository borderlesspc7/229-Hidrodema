import { useMemo, useState } from "react";
import Card from "../../../../components/ui/Card/Card";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import type {
  Project,
  ProjectCompletionReport,
} from "../../../../types/obrasGerenciamentoModule";
import ProjectSelector from "./ProjectSelector";
import {
  sanitizeForDatabase,
  validateObraReportInput,
  validateRequiredText,
} from "../../../../lib/validation";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";

type Props = {
  projects: Project[];
  initialProjectId?: string;
  initialReport?: ProjectCompletionReport;
  onCancel: () => void;
  onSubmit: (report: ProjectCompletionReport) => void | Promise<void>;
};

export default function ProjectCompletionForm({
  projects,
  initialProjectId = "",
  initialReport,
  onCancel,
  onSubmit,
}: Props) {
  const defaultProjectId = useMemo(
    () => initialReport?.projectId ?? initialProjectId ?? "",
    [initialProjectId, initialReport?.projectId]
  );

  const [projectId, setProjectId] = useState(defaultProjectId);
  const [date, setDate] = useState(
    initialReport?.date ?? new Date().toISOString().split("T")[0]
  );
  const [finalStatus, setFinalStatus] = useState<ProjectCompletionReport["finalStatus"]>(
    initialReport?.finalStatus ?? "concluida"
  );
  const [summary, setSummary] = useState(initialReport?.summary ?? "");
  const [pendingItems, setPendingItems] = useState(initialReport?.pendingItems ?? "");

  const handleSave = async () => {
    const base: ProjectCompletionReport = {
      id: initialReport?.id ?? Date.now().toString(),
      type: "project-completion",
      projectId,
      date,
      finalStatus,
      summary,
      pendingItems,
      createdAt: initialReport?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const v = validateObraReportInput(base);
    if (!v.ok) return alert(v.errors.join("\n"));

    const s = validateRequiredText(summary, "Resumo", { minLen: 5, maxLen: 5000 });
    if (!s.ok) return alert(s.errors.join("\n"));

    await onSubmit(
      sanitizeForDatabase({
        ...base,
        summary: s.value,
      })
    );
  };

  return (
    <div className="obras-form-container">
      <Card variant="service" className="obras-form-card" title="" textColor="#1e293b">
        <div className="obras-form-header">
          <h2 className="obras-form-title">
            {initialReport ? "EDITAR CONCLUSÃO" : "CONCLUSÃO DE OBRA"}
          </h2>
          <p className="obras-form-subtitle">Fechamento e pendências</p>
        </div>

        <div className="obras-form-content">
          <ProjectSelector projects={projects} value={projectId} onChange={setProjectId} required />

          <div className="obras-form-row">
            <div className="obras-form-field">
              <label>Data *</label>
              <Input type="date" value={date} onChange={setDate} required placeholder="Selecione a data" />
            </div>
            <div className="obras-form-field">
              <label>Status final</label>
              <select
                className="obras-select"
                value={finalStatus}
                onChange={(e) =>
                  setFinalStatus(e.target.value as ProjectCompletionReport["finalStatus"])
                }
              >
                <option value="concluida">Concluída</option>
                <option value="parcial">Parcial</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="obras-form-field">
            <label>Resumo *</label>
            <textarea
              className="obras-textarea"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={6}
            />
          </div>

          <div className="obras-form-field">
            <label>Pendências</label>
            <textarea
              className="obras-textarea"
              value={pendingItems}
              onChange={(e) => setPendingItems(e.target.value)}
              rows={4}
            />
          </div>

          <div className="obras-form-actions">
            <Button variant="secondary" onClick={onCancel} className="obras-action-btn">
              <FiArrowLeft size={16} />
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => void handleSave()} className="obras-action-btn obras-submit-btn">
              <FiCheckCircle size={16} />
              {initialReport ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

