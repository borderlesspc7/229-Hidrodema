import { useCallback, useEffect, useState } from "react";
import Card from "../../../../components/ui/Card/Card";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import ObrasSubmoduleLayout from "../ObrasSubmoduleLayout";
import { useAuth } from "../../../../hooks/useAuth";
import {
  createObraProblema,
  deleteObraProblema,
  listProblemasByProject,
  updateObraProblema,
  type ObraProblema,
  type ProblemaPrioridade,
  type ProblemaStatus,
} from "../../../../services/obrasProblemasService";
import {
  listObraProjectsForUser,
  type ObraProject,
} from "../../../../services/obrasProjectsService";
import { FiAlertTriangle, FiEdit3, FiPlus, FiTrash2 } from "react-icons/fi";
import "./ProblemasPage.css";

const CATEGORIAS_SUGERIDAS = [
  "Estrutural",
  "Instalações",
  "Segurança",
  "Prazo",
  "Qualidade",
  "Outro",
];

const PRIORIDADES: { value: ProblemaPrioridade; label: string }[] = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

const STATUS_OPTS: { value: ProblemaStatus; label: string }[] = [
  { value: "aberto", label: "Aberto" },
  { value: "em-andamento", label: "Em andamento" },
  { value: "aguardando", label: "Aguardando" },
  { value: "resolvido", label: "Resolvido" },
];

function priorityClass(p: ProblemaPrioridade): string {
  return p === "alta" ? "alta" : p === "media" ? "media" : "baixa";
}

export default function ProblemasPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ObraProject[]>([]);
  const [projectId, setProjectId] = useState("");
  const [rows, setRows] = useState<ObraProblema[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<ProblemaPrioridade>("media");
  const [status, setStatus] = useState<ProblemaStatus>("aberto");

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
      const list = await listProblemasByProject(projectId);
      setRows(list);
    } catch (e) {
      console.error(e);
      alert("Não foi possível carregar os problemas. Verifique o Firebase.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("media");
    setStatus("aberto");
  };

  const handleSubmit = async () => {
    if (!projectId || !selectedObra) {
      alert("Selecione uma obra cadastrada.");
      return;
    }
    if (!title.trim() || !description.trim() || !category.trim()) {
      alert("Preencha título, descrição e categoria.");
      return;
    }
    try {
      if (editingId) {
        await updateObraProblema(editingId, {
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          priority,
          status,
          obraName: selectedObra.name,
        });
      } else {
        await createObraProblema({
          projectId,
          obraName: selectedObra.name,
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          priority,
          status,
          createdBy: user?.email ?? undefined,
        });
      }
      resetForm();
      await load();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar problema.");
    }
  };

  const handleEdit = (p: ObraProblema) => {
    if (!p.id) return;
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setCategory(p.category);
    setPriority(p.priority);
    setStatus(p.status);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este registro?")) return;
    try {
      await deleteObraProblema(id);
      if (editingId === id) resetForm();
      await load();
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir.");
    }
  };

  return (
    <ObrasSubmoduleLayout
      title="PROBLEMAS DE OBRA"
      subtitle="Acompanhamento de não conformidades e pendências"
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
                Cadastre obras em Gerenciamento de Obras → Obras.
              </p>
            )}
          </div>

          {projectId && (
            <>
              <h3 className="obra-submodule-section-title">
                <FiAlertTriangle />{" "}
                {editingId ? "Editar problema" : "Registrar problema"}
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
                  <label className="obra-submodule-label">Título</label>
                  <Input
                    type="text"
                    placeholder="Resumo do problema"
                    value={title}
                    onChange={setTitle}
                  />
                </div>
                <div className="obra-submodule-field">
                  <label className="obra-submodule-label">Prioridade</label>
                  <select
                    className="obra-submodule-select"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as ProblemaPrioridade)
                    }
                  >
                    {PRIORIDADES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="obra-submodule-field">
                  <label className="obra-submodule-label">Status</label>
                  <select
                    className="obra-submodule-select"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as ProblemaStatus)
                    }
                  >
                    {STATUS_OPTS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="obra-submodule-field obra-submodule-field-span2">
                  <label className="obra-submodule-label">Categoria</label>
                  <Input
                    type="text"
                    placeholder="Ex.: Estrutural, hidráulica…"
                    value={category}
                    onChange={setCategory}
                  />
                </div>
              </div>
              <div className="obra-submodule-field obra-submodule-field-full">
                <label className="obra-submodule-label">Descrição</label>
                <textarea
                  className="obra-submodule-textarea"
                  rows={4}
                  placeholder="Detalhe o problema, local, responsável esperado…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="obra-submodule-actions">
                <Button variant="primary" onClick={() => void handleSubmit()}>
                  <FiPlus size={18} />
                  {editingId ? "Atualizar" : "Registrar"}
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
            <h3 className="obra-submodule-section-title">Lista</h3>
            {loading ? (
              <p className="obra-submodule-muted">Carregando…</p>
            ) : rows.length === 0 ? (
              <p className="obra-submodule-muted">Nenhum problema registrado.</p>
            ) : (
              <div className="obra-medicoes-grid">
                {rows.map((p) => (
                  <div key={p.id} className="obra-medicao-card">
                    <div className="obra-medicao-card-head">
                      <span className="obra-medicao-cat">{p.category}</span>
                      <span
                        className={`obra-problema-priority ${priorityClass(
                          p.priority
                        )}`}
                      >
                        {PRIORIDADES.find((x) => x.value === p.priority)?.label}
                      </span>
                    </div>
                    <div className="obra-problema-title">{p.title}</div>
                    <p className="obra-problema-desc">{p.description}</p>
                    <p className="obra-problema-status">
                      Status:{" "}
                      {STATUS_OPTS.find((s) => s.value === p.status)?.label}
                    </p>
                    <div className="obra-medicao-actions">
                      <button
                        type="button"
                        className="obra-icon-btn"
                        onClick={() => handleEdit(p)}
                        aria-label="Editar"
                      >
                        <FiEdit3 />
                      </button>
                      <button
                        type="button"
                        className="obra-icon-btn obra-icon-btn-danger"
                        onClick={() => p.id && void handleDelete(p.id)}
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
