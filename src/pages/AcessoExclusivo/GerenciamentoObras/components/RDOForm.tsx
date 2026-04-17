import { useEffect, useMemo, useState } from "react";
import Card from "../../../../components/ui/Card/Card";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import type { Project, RDOReport } from "../../../../types/obrasGerenciamentoModule";
import ProjectSelector from "./ProjectSelector";
import {
  sanitizeForDatabase,
  validateObraReportInput,
  validateRequiredText,
} from "../../../../lib/validation";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import {
  useAutosaveLocalDraft,
  clearDraftKey,
  tryLoadDraft,
} from "../../../../hooks/useAutosaveLocalDraft";

type Props = {
  projects: Project[];
  initialProjectId?: string;
  initialReport?: RDOReport;
  /** Chave localStorage para auto-save (só formulários "novo") */
  draftStorageKey?: string;
  onCancel: () => void;
  onSubmit: (report: RDOReport) => void | Promise<void>;
};

export default function RDOForm({
  projects,
  initialProjectId = "",
  initialReport,
  draftStorageKey,
  onCancel,
  onSubmit,
}: Props) {
  const defaultProjectId = useMemo(
    () => initialReport?.projectId ?? initialProjectId ?? "",
    [initialProjectId, initialReport?.projectId]
  );

  const [projectId, setProjectId] = useState(defaultProjectId);
  const [date, setDate] = useState(initialReport?.date ?? new Date().toISOString().split("T")[0]);
  const [activities, setActivities] = useState(initialReport?.activities ?? "");
  const [observations, setObservations] = useState(initialReport?.observations ?? "");
  const [weather, setWeather] = useState(initialReport?.weather ?? "");
  const [responsible, setResponsible] = useState(initialReport?.responsible ?? "");
  const [teamText, setTeamText] = useState((initialReport?.team ?? []).join(", "));

  useEffect(() => {
    if (!draftStorageKey || initialReport) return;
    const d = tryLoadDraft<{
      projectId?: string;
      date?: string;
      activities?: string;
      observations?: string;
      weather?: string;
      responsible?: string;
      teamText?: string;
    }>(draftStorageKey);
    if (!d || (!d.activities && !d.projectId)) return;
    if (!confirm("Existe um rascunho guardado automaticamente. Restaurar?")) {
      clearDraftKey(draftStorageKey);
      return;
    }
    if (d.projectId) setProjectId(d.projectId);
    if (d.date) setDate(d.date);
    if (d.activities != null) setActivities(d.activities);
    if (d.observations != null) setObservations(d.observations);
    if (d.weather != null) setWeather(d.weather);
    if (d.responsible != null) setResponsible(d.responsible);
    if (d.teamText != null) setTeamText(d.teamText);
  }, [draftStorageKey, initialReport]);

  useAutosaveLocalDraft(
    draftStorageKey && !initialReport ? draftStorageKey : null,
    () => ({
      projectId,
      date,
      activities,
      observations,
      weather,
      responsible,
      teamText,
    }),
    [projectId, date, activities, observations, weather, responsible, teamText, draftStorageKey, initialReport]
  );

  const handleSave = async () => {
    const team = teamText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const base: RDOReport = {
      id: initialReport?.id ?? Date.now().toString(),
      type: "rdo",
      projectId,
      date,
      activities,
      observations,
      photos: initialReport?.photos ?? [],
      team,
      weather,
      responsible,
      createdAt: initialReport?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      finalizedAt: initialReport?.finalizedAt,
      finalizedByEmail: initialReport?.finalizedByEmail,
    };

    const v = validateObraReportInput(base);
    if (!v.ok) {
      alert(v.errors.join("\n"));
      return;
    }
    const act = validateRequiredText(base.activities, "Atividades", { minLen: 3, maxLen: 10000 });
    if (!act.ok) {
      alert(act.errors.join("\n"));
      return;
    }

    await onSubmit(sanitizeForDatabase({ ...base, activities: act.value }));
    if (draftStorageKey) clearDraftKey(draftStorageKey);
  };

  return (
    <div className="obras-form-container">
      <Card variant="service" className="obras-form-card" title="" textColor="#1e293b">
        <div className="obras-form-header">
          <h2 className="obras-form-title">{initialReport ? "EDITAR RDO" : "NOVO RDO"}</h2>
          <p className="obras-form-subtitle">
            Relatório Diário de Obra
            {draftStorageKey && !initialReport ? (
              <span style={{ display: "block", marginTop: 6, fontSize: 12, opacity: 0.85 }}>
                Rascunho guardado automaticamente a cada ~45 s neste dispositivo.
              </span>
            ) : null}
          </p>
        </div>

        <div className="obras-form-content">
          <ProjectSelector projects={projects} value={projectId} onChange={setProjectId} required />

          <div className="obras-form-row">
            <div className="obras-form-field">
              <label>Data *</label>
              <Input type="date" value={date} onChange={setDate} required placeholder="Selecione a data" />
            </div>
            <div className="obras-form-field">
              <label>Responsável</label>
              <Input type="text" value={responsible} onChange={setResponsible} placeholder="Nome" />
            </div>
          </div>

          <div className="obras-form-field">
            <label>Equipe (separar por vírgula)</label>
            <Input type="text" value={teamText} onChange={setTeamText} placeholder="Ex: João, Maria" />
          </div>

          <div className="obras-form-row">
            <div className="obras-form-field">
              <label>Clima</label>
              <Input type="text" value={weather} onChange={setWeather} placeholder="Ex: Ensolarado" />
            </div>
          </div>

          <div className="obras-form-field">
            <label>Atividades *</label>
            <textarea
              className="obras-textarea"
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              rows={6}
              placeholder="Descreva as atividades do dia"
            />
          </div>

          <div className="obras-form-field">
            <label>Observações</label>
            <textarea
              className="obras-textarea"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              placeholder="Observações gerais"
            />
          </div>

          <div className="obras-form-actions">
            <Button variant="secondary" onClick={onCancel} className="obras-action-btn">
              <FiArrowLeft size={16} />
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => void handleSave()} className="obras-action-btn obras-submit-btn">
              <FiCheckCircle size={16} />
              {initialReport ? "Atualizar RDO" : "Salvar RDO"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
