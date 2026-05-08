import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button/Button";
import Card from "../../../components/ui/Card/Card";
import Input from "../../../components/ui/Input/Input";
import { useAuth } from "../../../hooks/useAuth";
import { listDynamicFormTemplates, upsertDynamicFormTemplate, archiveDynamicFormTemplate } from "../../../services/dynamicFormsService";
import type {
  DynamicFormField,
  DynamicFormFieldType,
  DynamicFormTemplate,
  DynamicFormValue,
} from "../../../types/dynamicForms";
import DynamicForm from "../../../components/DynamicForm/DynamicForm";
import { validateDynamicForm } from "../../../lib/dynamicFormRuntime";

const emptyField = (): DynamicFormField => ({
  id: `f_${Date.now()}`,
  type: "text",
  label: "Nova pergunta",
  section: "Geral",
  validators: [{ type: "required" }],
});

export default function ConfiguracaoFormularios() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<DynamicFormTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const [draft, setDraft] = useState<{
    key: string;
    name: string;
    status: DynamicFormTemplate["status"];
    version: number;
    fields: DynamicFormField[];
  }>({ key: "visitas", name: "Visitas", status: "active", version: 1, fields: [emptyField()] });

  const selected = useMemo(() => templates.find((t) => t.id === selectedId) ?? null, [selectedId, templates]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void (async () => {
      try {
        const list = await listDynamicFormTemplates();
        if (!alive) return;
        setTemplates(list);
        if (list[0]?.id) setSelectedId(list[0].id);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    setDraft({
      key: selected.key,
      name: selected.name,
      status: selected.status,
      version: selected.version,
      fields: selected.fields ?? [],
    });
  }, [selected]);

  const addField = () => setDraft((d) => ({ ...d, fields: [...d.fields, emptyField()] }));

  const removeField = (id: string) =>
    setDraft((d) => ({ ...d, fields: d.fields.filter((f) => f.id !== id) }));

  const updateField = (id: string, patch: Partial<DynamicFormField>) =>
    setDraft((d) => ({
      ...d,
      fields: d.fields.map((f) => (f.id === id ? ({ ...f, ...patch } as DynamicFormField) : f)),
    }));

  const save = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      const payload: Omit<DynamicFormTemplate, "createdAt" | "updatedAt"> & { createdAt?: string; updatedAt?: string } = {
        id: selected?.id,
        key: draft.key.trim(),
        name: draft.name.trim(),
        status: draft.status,
        version: Number(draft.version) || 1,
        fields: draft.fields,
      };
      await upsertDynamicFormTemplate({ ...payload, updatedAt: now, createdAt: selected?.createdAt });
      const list = await listDynamicFormTemplates();
      setTemplates(list);
      alert("Template salvo.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const archive = async () => {
    if (!selected?.id) return;
    if (!confirm("Arquivar este template?")) return;
    setLoading(true);
    try {
      await archiveDynamicFormTemplate(selected.id);
      const list = await listDynamicFormTemplates();
      setTemplates(list);
      alert("Arquivado.");
    } finally {
      setLoading(false);
    }
  };

  // Preview
  const [previewValues, setPreviewValues] = useState<Record<string, DynamicFormValue>>({});
  const previewValidation = validateDynamicForm({ fields: draft.fields }, previewValues);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 12px" }}>
      <h1 style={{ color: "#0f172a", marginBottom: 8 }}>Configuração de formulários</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Admin/gestor: edite templates (versão/ativo/arquivado). Renderização dinâmica usa o JSON salvo no Firestore.
      </p>

      <Card variant="service" title="Templates" textColor="#0f172a" backgroundColor="#ffffff">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #e2e8f0", minWidth: 320 }}
          >
            <option value="">Selecione…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.key} v{t.version} — {t.status}
              </option>
            ))}
          </select>

          <Button variant="secondary" type="button" disabled={loading} onClick={addField}>
            Adicionar pergunta
          </Button>
          <Button variant="primary" type="button" disabled={loading} onClick={() => void save()}>
            Salvar
          </Button>
          <Button variant="secondary" type="button" disabled={loading || !selected?.id} onClick={() => void archive()}>
            Arquivar
          </Button>
          <span style={{ marginLeft: "auto", opacity: 0.75 }}>
            Sessão: {user?.email ?? "—"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px 140px", gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700 }}>Key</label>
              <Input type="text" value={draft.key} onChange={(v) => setDraft((d) => ({ ...d, key: v }))} />
            </div>
            <div>
              <label style={{ fontWeight: 700 }}>Nome</label>
              <Input type="text" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
            </div>
            <div>
              <label style={{ fontWeight: 700 }}>Versão</label>
              <Input
                type="number"
                value={String(draft.version)}
                onChange={(v) => setDraft((d) => ({ ...d, version: Number(v) || 1 }))}
              />
            </div>
            <div>
              <label style={{ fontWeight: 700 }}>Status</label>
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    status: e.target.value as DynamicFormTemplate["status"],
                  }))
                }
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e2e8f0" }}
              >
                <option value="active">active</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </div>

          {draft.fields.map((f) => (
            <div
              key={f.id}
              style={{
                padding: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "200px 180px 1fr 120px", gap: 10, alignItems: "end" }}>
                <div>
                  <label style={{ fontWeight: 700 }}>ID</label>
                  <Input type="text" value={f.id} onChange={(v) => updateField(f.id, { id: v.trim() })} />
                </div>
                <div>
                  <label style={{ fontWeight: 700 }}>Tipo</label>
                  <select
                    value={f.type}
                    onChange={(e) =>
                      updateField(f.id, { type: e.target.value as DynamicFormFieldType })
                    }
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e2e8f0" }}
                  >
                    {["text","textarea","number","date","time","select","radio","checkbox"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 700 }}>Label</label>
                  <Input type="text" value={f.label} onChange={(v) => updateField(f.id, { label: v })} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="secondary" type="button" onClick={() => removeField(f.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ height: 18 }} />

      <Card variant="service" title="Preview" textColor="#0f172a" backgroundColor="#ffffff">
        {!previewValidation.ok ? (
          <div style={{ marginBottom: 10, color: "#b45309" }}>
            {previewValidation.errors.join(" ")}
          </div>
        ) : null}
        <DynamicForm template={{ fields: draft.fields }} value={previewValues} onChange={setPreviewValues} />
      </Card>
    </div>
  );
}
