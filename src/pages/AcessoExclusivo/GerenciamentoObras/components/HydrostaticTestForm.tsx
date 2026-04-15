import { useMemo, useState } from "react";
import Card from "../../../../components/ui/Card/Card";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import type {
  HydrostaticTestReport,
  Project,
} from "../../../../types/obrasGerenciamentoModule";
import ProjectSelector from "./ProjectSelector";
import {
  sanitizeForDatabase,
  validateNonNegativeNumber,
  validateObraReportInput,
} from "../../../../lib/validation";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";

type Props = {
  projects: Project[];
  initialProjectId?: string;
  initialReport?: HydrostaticTestReport;
  onCancel: () => void;
  onSubmit: (report: HydrostaticTestReport) => void | Promise<void>;
};

export default function HydrostaticTestForm({
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
  const [pressure, setPressure] = useState(String(initialReport?.pressure ?? 0));
  const [durationMinutes, setDurationMinutes] = useState(
    String(initialReport?.durationMinutes ?? 0)
  );
  const [result, setResult] = useState<HydrostaticTestReport["result"]>(
    initialReport?.result ?? "aprovado"
  );
  const [notes, setNotes] = useState(initialReport?.notes ?? "");

  const handleSave = async () => {
    const base: HydrostaticTestReport = {
      id: initialReport?.id ?? Date.now().toString(),
      type: "hydrostatic-test",
      projectId,
      date,
      pressure: Number(pressure),
      durationMinutes: Number(durationMinutes),
      result,
      notes,
      createdAt: initialReport?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const v = validateObraReportInput(base);
    if (!v.ok) return alert(v.errors.join("\n"));

    const p = validateNonNegativeNumber(pressure, "Pressão");
    const d = validateNonNegativeNumber(durationMinutes, "Duração (min)");
    if (!p.ok || !d.ok) {
      alert([...(p.ok ? [] : p.errors), ...(d.ok ? [] : d.errors)].join("\n"));
      return;
    }

    await onSubmit(
      sanitizeForDatabase({
        ...base,
        pressure: p.value,
        durationMinutes: d.value,
      })
    );
  };

  return (
    <div className="obras-form-container">
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">
            {initialReport ? "EDITAR TESTE" : "NOVO TESTE HIDROSTÁTICO"}
          </h2>
          <p className="obras-form-subtitle">Registro de teste</p>
        </div>

        <div className="obras-form-content">
          <ProjectSelector
            projects={projects}
            value={projectId}
            onChange={setProjectId}
            required
          />

          <div className="obras-form-row">
            <div className="obras-form-field">
              <label>Data *</label>
              <Input type="date" value={date} onChange={setDate} required placeholder="Selecione a data" />
            </div>
            <div className="obras-form-field">
              <label>Resultado</label>
              <select
                className="obras-select"
                value={result}
                onChange={(e) =>
                  setResult(e.target.value as HydrostaticTestReport["result"])
                }
              >
                <option value="aprovado">Aprovado</option>
                <option value="reprovado">Reprovado</option>
              </select>
            </div>
          </div>

          <div className="obras-form-row">
            <div className="obras-form-field">
              <label>Pressão</label>
              <Input type="number" value={pressure} onChange={setPressure} placeholder="0" />
            </div>
            <div className="obras-form-field">
              <label>Duração (min)</label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={setDurationMinutes}
                placeholder="0"
              />
            </div>
          </div>

          <div className="obras-form-field">
            <label>Observações</label>
            <textarea
              className="obras-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="obras-action-btn"
            >
              <FiArrowLeft size={16} />
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleSave()}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              {initialReport ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

