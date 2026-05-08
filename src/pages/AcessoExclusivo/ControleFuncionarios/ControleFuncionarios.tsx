import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Card from "../../../components/ui/Card/Card";
import Input from "../../../components/ui/Input/Input";
import { useAuth } from "../../../hooks/useAuth";
import { normalizeRole, isAdmin } from "../../../lib/rbac";
import { listUsers, updateUserAdminFields } from "../../../services/usersService";
import { createDelegatedTask } from "../../../services/delegatedTasksService";
import type { User, UserRole } from "../../../types/user";
import { paths } from "../../../routes/paths";
import { FiArrowLeft, FiRefreshCw, FiSave, FiUsers } from "react-icons/fi";
import "./ControleFuncionarios.css";

type RowDraft = {
  role: UserRole;
  name: string;
  sellerCode: string;
  sellerExternalId: string;
  specialties: string;
  specialtyNote: string;
};

export default function ControleFuncionarios() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState<string>("");

  const canSee = isAdmin(user);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listUsers();
      setRows(list);
      setDrafts(
        Object.fromEntries(
          list.map((u) => [
            u.uid,
            {
              role: normalizeRole(u.role),
              name: u.name ?? "",
              sellerCode: u.sellerCode ?? "",
              sellerExternalId: u.sellerExternalId ?? "",
              specialties: (u.specialties ?? []).join(", "),
              specialtyNote: u.specialtyNote ?? "",
            },
          ])
        )
      );
    } catch (e) {
      console.error(e);
      alert("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (!canSee) {
      navigate(paths.acessoExclusivo);
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((u) => {
      const hay = `${u.name ?? ""} ${u.email ?? ""} ${u.sellerCode ?? ""} ${u.sellerExternalId ?? ""} ${(u.specialties ?? []).join(" ")} ${u.specialtyNote ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, rows]);

  const updateDraft = (uid: string, patch: Partial<RowDraft>) => {
    setDrafts((prev) => ({ ...prev, [uid]: { ...prev[uid], ...patch } }));
  };

  const saveRow = async (uid: string) => {
    const d = drafts[uid];
    if (!d) return;
    setLoading(true);
    try {
      await updateUserAdminFields(uid, {
        role: d.role,
        name: d.name.trim(),
        sellerCode: d.sellerCode.trim() || undefined,
        sellerExternalId: d.sellerExternalId.trim() || undefined,
        specialties: d.specialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        specialtyNote: d.specialtyNote.trim() || undefined,
      });
      await load();
    } catch (e) {
      console.error(e);
      alert("Não foi possível salvar as alterações.");
      setLoading(false);
    }
  };

  const assignTask = async () => {
    const assigneeUid = taskAssignee.trim();
    const title = taskTitle.trim();
    if (!assigneeUid || !title) {
      alert("Selecione um usuário e informe um título.");
      return;
    }
    setLoading(true);
    try {
      const assignee = rows.find((r) => r.uid === assigneeUid);
      await createDelegatedTask({
        title,
        description: taskDesc.trim() || undefined,
        status: "queued",
        assigneeUid,
        assigneeEmail: assignee?.email,
        createdByUid: user?.uid ?? "",
        createdByEmail: user?.email ?? "",
      });
      setTaskTitle("");
      setTaskDesc("");
      alert("Tarefa delegada.");
    } catch (e) {
      console.error(e);
      alert("Não foi possível delegar a tarefa.");
    } finally {
      setLoading(false);
    }
  };

  if (!canSee) return null;

  return (
    <div className="funcionarios-container">
      <div className="funcionarios-header">
        <Button
          variant="secondary"
          onClick={() => navigate(paths.acessoExclusivo)}
          className="funcionarios-back"
        >
          <FiArrowLeft size={16} />
          Voltar
        </Button>
        <div className="funcionarios-title">
          <FiUsers />
          Controle de Funcionários
        </div>
        <Button variant="secondary" onClick={() => void load()}>
          <FiRefreshCw size={16} />
          Atualizar
        </Button>
      </div>

      <Card variant="service" title="" textColor="#1e293b" className="funcionarios-card">
        <div className="funcionarios-toolbar">
          <div className="funcionarios-search">
            <label>Buscar</label>
            <Input
              type="text"
              placeholder="Nome, e-mail, código..."
              value={query}
              onChange={setQuery}
            />
          </div>
          {loading && <span className="funcionarios-loading">Carregando…</span>}
        </div>

        <div style={{ marginBottom: 14 }}>
          <h3 style={{ margin: "8px 0" }}>Delegar tarefa</h3>
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 160px", gap: 10, alignItems: "end" }}>
            <div>
              <label>Destinatário</label>
              <select
                className="funcionarios-select"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
              >
                <option value="">Selecione…</option>
                {rows.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Título</label>
              <Input type="text" value={taskTitle} onChange={setTaskTitle} placeholder="Ex.: Revisar solicitação SERV-..." />
              <label>Descrição (opcional)</label>
              <Input type="text" value={taskDesc} onChange={setTaskDesc} placeholder="Detalhes rápidos…" />
            </div>
            <div>
              <Button variant="primary" onClick={() => void assignTask()} disabled={loading}>
                <FiSave size={16} />
                Delegar
              </Button>
            </div>
          </div>
        </div>

        <div className="funcionarios-table-wrap">
          <table className="funcionarios-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Cód. vendedor</th>
                <th>ID externo</th>
                <th>Competências</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const d = drafts[u.uid];
                if (!d) return null;
                const isSelf = user?.uid === u.uid;
                return (
                  <tr key={u.uid}>
                    <td style={{ minWidth: 220 }}>
                      <Input
                        type="text"
                        value={d.name}
                        onChange={(v) => updateDraft(u.uid, { name: v })}
                        placeholder="Nome"
                      />
                    </td>
                    <td style={{ minWidth: 240 }}>{u.email}</td>
                    <td style={{ minWidth: 170 }}>
                      <select
                        className="funcionarios-select"
                        value={d.role}
                        onChange={(e) =>
                          updateDraft(u.uid, { role: e.target.value as UserRole })
                        }
                        aria-label="Selecionar perfil"
                        disabled={isSelf}
                        title={
                          isSelf
                            ? "Por segurança, você não pode alterar seu próprio perfil aqui."
                            : undefined
                        }
                      >
                        <option value="user">user</option>
                        <option value="vendedor">vendedor</option>
                        <option value="gestor">gestor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ minWidth: 140 }}>
                      <Input
                        type="text"
                        value={d.sellerCode}
                        onChange={(v) => updateDraft(u.uid, { sellerCode: v })}
                        placeholder="Ex.: 035184"
                      />
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <Input
                        type="text"
                        value={d.sellerExternalId}
                        onChange={(v) => updateDraft(u.uid, { sellerExternalId: v })}
                        placeholder="Externo"
                      />
                    </td>
                    <td style={{ minWidth: 260 }}>
                      <Input
                        type="text"
                        value={d.specialties}
                        onChange={(v) => updateDraft(u.uid, { specialties: v })}
                        placeholder="Ex.: hidráulica, elétrica, inspeção"
                      />
                      <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>
                        Separe por vírgula.
                      </div>
                      <Input
                        type="text"
                        value={d.specialtyNote}
                        onChange={(v) => updateDraft(u.uid, { specialtyNote: v })}
                        placeholder="Nota (opcional): nível, região, restrições…"
                      />
                    </td>
                    <td style={{ minWidth: 120 }}>
                      <Button
                        variant="primary"
                        onClick={() => void saveRow(u.uid)}
                        disabled={loading}
                        className="funcionarios-save"
                      >
                        <FiSave size={16} />
                        Salvar
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="funcionarios-empty">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
