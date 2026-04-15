import { useCallback, useEffect, useState } from "react";
import Card from "../../../../components/ui/Card/Card";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import ObrasSubmoduleLayout from "../ObrasSubmoduleLayout";
import { useAuth } from "../../../../hooks/useAuth";
import {
  deleteObraDocumento,
  listDocumentosByProject,
  uploadObraDocumento,
  updateObraDocumentoMeta,
  type ObraDocumentoMeta,
} from "../../../../services/obrasDocumentosService";
import { listObraProjects, type ObraProject } from "../../../../services/obrasProjectsService";
import { FiEdit3, FiFileText, FiPlus, FiTrash2, FiExternalLink } from "react-icons/fi";
import "./DocumentosPage.css";

const CATEGORIAS_SUGERIDAS = [
  "Projeto",
  "ART / Responsável técnico",
  "Medição",
  "Segurança",
  "Contrato",
  "Outro",
];

function formatSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentosPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ObraProject[]>([]);
  const [projectId, setProjectId] = useState("");
  const [rows, setRows] = useState<ObraDocumentoMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const selectedObra = projects.find((p) => p.id === projectId);

  useEffect(() => {
    (async () => {
      try {
        const list = await listObraProjects();
        setProjects(list);
      } catch (e) {
        console.error(e);
        setProjects([]);
      }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!projectId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const list = await listDocumentosByProject(projectId);
      setRows(list);
    } catch (e) {
      console.error(e);
      alert("Não foi possível carregar os documentos. Verifique o Firebase.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetUploadForm = () => {
    setFile(null);
    setCategory("");
    setDescription("");
  };

  const handleUpload = async () => {
    if (!projectId || !selectedObra) {
      alert("Selecione uma obra cadastrada.");
      return;
    }
    if (!file) {
      alert("Escolha um arquivo.");
      return;
    }
    if (!category.trim()) {
      alert("Informe a categoria.");
      return;
    }
    try {
      await uploadObraDocumento(file, {
        projectId,
        obraName: selectedObra.name,
        category: category.trim(),
        description: description.trim(),
        uploadedBy: user?.email ?? undefined,
      });
      resetUploadForm();
      await load();
    } catch (e) {
      console.error(e);
      alert("Erro ao enviar documento. Verifique permissões do Storage.");
    }
  };

  const handleDelete = async (d: ObraDocumentoMeta) => {
    if (!d.id) return;
    if (!confirm("Excluir este documento do armazenamento?")) return;
    try {
      await deleteObraDocumento({
        id: d.id,
        storagePath: d.storagePath,
      });
      if (editingId === d.id) {
        setEditingId(null);
      }
      await load();
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir.");
    }
  };

  const startEdit = (d: ObraDocumentoMeta) => {
    if (!d.id) return;
    setEditingId(d.id);
    setEditCategory(d.category);
    setEditDescription(d.description);
  };

  const saveEdit = async (id: string) => {
    try {
      await updateObraDocumentoMeta(id, {
        category: editCategory.trim(),
        description: editDescription.trim(),
      });
      setEditingId(null);
      await load();
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar.");
    }
  };

  return (
    <ObrasSubmoduleLayout
      title="DOCUMENTOS DE OBRA"
      subtitle="Arquivos técnicos e administrativos por obra"
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
                  resetUploadForm();
                  setEditingId(null);
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
                <FiFileText /> Novo upload
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
              <div className="obra-doc-file-row">
                <input
                  type="file"
                  className="obra-doc-file-input"
                  onChange={(e) =>
                    setFile(e.target.files?.[0] ?? null)
                  }
                />
              </div>
              <div className="obra-submodule-form-grid">
                <div className="obra-submodule-field obra-submodule-field-span2">
                  <label className="obra-submodule-label">Categoria</label>
                  <Input
                    type="text"
                    placeholder="Ex.: Projeto executivo"
                    value={category}
                    onChange={setCategory}
                  />
                </div>
              </div>
              <div className="obra-submodule-field obra-submodule-field-full">
                <label className="obra-submodule-label">Descrição (opcional)</label>
                <textarea
                  className="obra-submodule-textarea"
                  rows={2}
                  placeholder="Notas sobre o arquivo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="obra-submodule-actions">
                <Button variant="primary" onClick={() => void handleUpload()}>
                  <FiPlus size={18} />
                  Enviar
                </Button>
              </div>
            </>
          )}
        </Card>

        {projectId && (
          <div className="obra-submodule-list">
            <h3 className="obra-submodule-section-title">Arquivos</h3>
            {loading ? (
              <p className="obra-submodule-muted">Carregando…</p>
            ) : rows.length === 0 ? (
              <p className="obra-submodule-muted">Nenhum documento enviado.</p>
            ) : (
              <div className="obra-medicoes-grid">
                {rows.map((d) => (
                  <div key={d.id} className="obra-medicao-card">
                    <div className="obra-medicao-card-head">
                      <span className="obra-medicao-cat">{d.category}</span>
                      <span className="obra-medicao-date">
                        {d.uploadedAt.slice(0, 10)}
                      </span>
                    </div>
                    <p className="obra-doc-card-title">{d.fileName}</p>
                    <p className="obra-doc-meta">
                      {formatSize(d.sizeBytes)} · {d.mimeType}
                    </p>
                    {d.description && editingId !== d.id && (
                      <p className="obra-medicao-notes">{d.description}</p>
                    )}
                    <a
                      className="obra-doc-link"
                      href={d.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir arquivo <FiExternalLink size={14} />
                    </a>
                    {editingId === d.id ? (
                      <>
                        <div className="obra-submodule-field obra-submodule-field-full">
                          <label className="obra-submodule-label">Categoria</label>
                          <Input
                            type="text"
                            placeholder="Categoria"
                            value={editCategory}
                            onChange={setEditCategory}
                          />
                        </div>
                        <div className="obra-submodule-field obra-submodule-field-full">
                          <label className="obra-submodule-label">Descrição</label>
                          <textarea
                            className="obra-submodule-textarea"
                            rows={2}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        </div>
                        <div className="obra-submodule-actions">
                          <Button
                            variant="primary"
                            onClick={() => d.id && void saveEdit(d.id)}
                          >
                            Salvar
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="obra-medicao-actions">
                        <button
                          type="button"
                          className="obra-icon-btn"
                          onClick={() => startEdit(d)}
                          aria-label="Editar metadados"
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          type="button"
                          className="obra-icon-btn obra-icon-btn-danger"
                          onClick={() => void handleDelete(d)}
                          aria-label="Excluir"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
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
