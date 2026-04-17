import { useCallback, useEffect, useState } from "react";
import Card from "../../../../components/ui/Card/Card";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import ObrasSubmoduleLayout from "../ObrasSubmoduleLayout";
import { useAuth } from "../../../../hooks/useAuth";
import {
  createObraMedicao,
  deleteObraMedicao,
  listMedicoesByProject,
  updateObraMedicao,
  type ObraMedicao,
} from "../../../../services/obrasMedicoesService";
import {
  listObraProjectsForUser,
  type ObraProject,
} from "../../../../services/obrasProjectsService";
import { FiEdit3, FiPlus, FiTrash2, FiLayers } from "react-icons/fi";
import "./MedicoesPage.css";

const CATEGORIAS_SUGERIDAS = [
  "Estrutural",
  "Instalações",
  "Acabamento",
  "Terraplenagem",
  "Outro",
];

export default function MedicoesPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ObraProject[]>([]);
  const [projectId, setProjectId] = useState("");
  const [rows, setRows] = useState<ObraMedicao[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("m");
  const [referenceDate, setReferenceDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");

  const selectedObra = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const list = await listObraProjectsForUser(user);
        setProjects(list);
      } catch (e) {
        console.error(e);
        setProjects([]);
      }
    })();
  }, [user]);

  const load = useCallback(async () => {
    if (!projectId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const list = await listMedicoesByProject(projectId);
      setRows(list);
    } catch (e) {
      console.error(e);
      alert("Não foi possível carregar as medições. Verifique o Firebase.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setCategory("");
    setValue("");
    setUnit("m");
    setReferenceDate(new Date().toISOString().slice(0, 10));
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!projectId || !selectedObra) {
      alert("Selecione uma obra cadastrada.");
      return;
    }
    if (!category.trim() || !value.trim() || !referenceDate) {
      alert("Preencha categoria, valor e data de referência.");
      return;
    }
    try {
      if (editingId) {
        await updateObraMedicao(editingId, {
          category: category.trim(),
          value: value.trim(),
          unit: unit.trim() || "-",
          referenceDate,
          notes: notes.trim() || undefined,
          obraName: selectedObra.name,
        });
      } else {
        await createObraMedicao({
          projectId,
          obraName: selectedObra.name,
          category: category.trim(),
          value: value.trim(),
          unit: unit.trim() || "-",
          referenceDate,
          notes: notes.trim() || undefined,
          createdBy: user?.email ?? undefined,
        });
      }
      resetForm();
      await load();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar medição.");
    }
  };

  const handleEdit = (m: ObraMedicao) => {
    if (!m.id) return;
    setEditingId(m.id);
    setCategory(m.category);
    setValue(m.value);
    setUnit(m.unit);
    setReferenceDate(m.referenceDate.slice(0, 10));
    setNotes(m.notes ?? "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta medição?")) return;
    try {
      await deleteObraMedicao(id);
      if (editingId === id) resetForm();
      await load();
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir.");
    }
  };

  return (
    <ObrasSubmoduleLayout
      title="MEDIÇÕES DE OBRA"
      subtitle="Registro técnico e quantitativo vinculado às obras"
    >
      <div className="obra-submodule-wrap">
        <Card
          variant="service"
          className="obra-submodule-card"
          title=""
          textColor="#1e293b"
        >
          <div className="obra-submodule-toolbar">
            <div className="obra-submodule-field obra-submodule-field-grow">
              <label className="obra-submodule-label">Obra</label>
              <select
                className="obras-select"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  resetForm();
                }}
              >
                <option value="">Selecione uma obra…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {projects.length === 0 && (
              <p className="obra-submodule-hint">
                Cadastre obras em Gerenciamento de Obras → Criar obra.
              </p>
            )}
          </div>

          {projectId && (
            <>
              <h3 className="obra-submodule-section-title">
                <FiLayers /> {editingId ? "Editar medição" : "Nova medição"}
              </h3>
              <div className="obra-submodule-chips" aria-label="Categorias sugeridas">
                {CATEGORIAS_SUGERIDAS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`obra-chip ${category === c ? "active" : ""}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="obra-submodule-form-grid">
                <div className="obra-submodule-field obra-submodule-field-span2">
                  <label className="obra-submodule-label">Categoria</label>
                  <Input
                    type="text"
                    placeholder="Ex.: Estrutural, alvenaria…"
                    value={category}
                    onChange={setCategory}
                  />
                </div>
                <div className="obra-submodule-field">
                  <label className="obra-submodule-label">Valor medido</label>
                  <Input
                    type="text"
                    placeholder="Ex.: 120,5"
                    value={value}
                    onChange={setValue}
                  />
                </div>
                <div className="obra-submodule-field">
                  <label className="obra-submodule-label">Unidade</label>
                  <Input
                    type="text"
                    placeholder="m, m², un…"
                    value={unit}
                    onChange={setUnit}
                  />
                </div>
                <div className="obra-submodule-field">
                  <label className="obra-submodule-label">Data de referência</label>
                  <input
                    type="date"
                    className="obra-submodule-date"
                    value={referenceDate}
                    onChange={(e) => setReferenceDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="obra-submodule-field obra-submodule-field-full">
                <label className="obra-submodule-label">Observações</label>
                <textarea
                  className="obra-submodule-textarea"
                  rows={3}
                  placeholder="Detalhes da medição, método, notas de auditoria…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="obra-submodule-actions">
                <Button variant="primary" onClick={() => void handleSubmit()}>
                  <FiPlus size={18} />
                  {editingId ? "Atualizar" : "Registrar medição"}
                </Button>
                {editingId && (
                  <Button variant="secondary" onClick={resetForm}>
                    Cancelar edição
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>

        {projectId && (
          <div className="obra-submodule-list">
            <h3 className="obra-submodule-section-title">Histórico</h3>
            {loading ? (
              <p className="obra-submodule-muted">Carregando…</p>
            ) : rows.length === 0 ? (
              <p className="obra-submodule-muted">Nenhuma medição registrada.</p>
            ) : (
              <div className="obra-medicoes-grid">
                {rows.map((m) => (
                  <div key={m.id} className="obra-medicao-card">
                    <div className="obra-medicao-card-head">
                      <span className="obra-medicao-cat">{m.category}</span>
                      <span className="obra-medicao-date">
                        {m.referenceDate.slice(0, 10)}
                      </span>
                    </div>
                    <div className="obra-medicao-value">
                      {m.value}{" "}
                      <small>{m.unit}</small>
                    </div>
                    {m.notes && (
                      <p className="obra-medicao-notes">{m.notes}</p>
                    )}
                    <div className="obra-medicao-actions">
                      <button
                        type="button"
                        className="obra-icon-btn"
                        onClick={() => handleEdit(m)}
                        aria-label="Editar"
                      >
                        <FiEdit3 />
                      </button>
                      <button
                        type="button"
                        className="obra-icon-btn obra-icon-btn-danger"
                        onClick={() => m.id && void handleDelete(m.id)}
                        aria-label="Excluir"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ObrasSubmoduleLayout>
  );
}
