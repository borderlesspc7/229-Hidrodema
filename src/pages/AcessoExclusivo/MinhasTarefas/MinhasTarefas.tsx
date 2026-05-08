import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Card from "../../../components/ui/Card/Card";
import { useAuth } from "../../../hooks/useAuth";
import { paths } from "../../../routes/paths";
import {
  listDelegatedTasksForAssignee,
  updateDelegatedTask,
  type DelegatedTask,
  type DelegatedTaskStatus,
} from "../../../services/delegatedTasksService";
import { FiArrowLeft, FiCheck, FiClock, FiRefreshCw } from "react-icons/fi";

const statusLabels: Record<DelegatedTaskStatus, string> = {
  queued: "Pendente",
  "in-progress": "Em andamento",
  done: "Concluída",
  cancelled: "Cancelada",
};

export default function MinhasTarefas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<DelegatedTask[]>([]);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const rows = await listDelegatedTasksForAssignee(user.uid);
      setTasks(
        rows.sort((a, b) => {
          const aTime = new Date(a.updatedAt || a.createdAt).getTime();
          const bTime = new Date(b.updatedAt || b.createdAt).getTime();
          return bTime - aTime;
        })
      );
    } catch (e) {
      console.error(e);
      alert("Não foi possível carregar suas tarefas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const totals = useMemo(
    () => ({
      open: tasks.filter((t) => t.status === "queued" || t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    }),
    [tasks]
  );

  const changeStatus = async (task: DelegatedTask, status: DelegatedTaskStatus) => {
    if (!task.id) return;
    setLoading(true);
    try {
      await updateDelegatedTask(task.id, { status });
      await load();
    } catch (e) {
      console.error(e);
      alert("Não foi possível atualizar a tarefa.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto", padding: "16px 12px" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <Button variant="secondary" onClick={() => navigate(paths.acessoExclusivo)}>
          <FiArrowLeft size={16} />
          Voltar
        </Button>
        <h1 style={{ margin: 0, color: "#0f172a", flex: 1 }}>Minhas Tarefas</h1>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          <FiRefreshCw size={16} />
          Atualizar
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
        <Card variant="service" title="ABERTAS" textColor="#0f172a" backgroundColor="#ffffff">
          <strong style={{ fontSize: 28 }}>{totals.open}</strong>
        </Card>
        <Card variant="service" title="CONCLUIDAS" textColor="#0f172a" backgroundColor="#ffffff">
          <strong style={{ fontSize: 28 }}>{totals.done}</strong>
        </Card>
      </div>

      <Card variant="service" title="" textColor="#0f172a" backgroundColor="#ffffff">
        {loading && <div style={{ marginBottom: 10 }}>Carregando...</div>}
        {tasks.length === 0 ? (
          <div style={{ padding: "28px 8px", textAlign: "center", opacity: 0.75 }}>
            Nenhuma tarefa atribuída a você.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{task.title}</div>
                  {task.description ? (
                    <div style={{ marginTop: 4, color: "#475569" }}>{task.description}</div>
                  ) : null}
                  <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                    {statusLabels[task.status]} · criada por {task.createdByEmail || "gestão"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {task.status === "queued" && (
                    <Button
                      variant="secondary"
                      disabled={loading}
                      onClick={() => void changeStatus(task, "in-progress")}
                    >
                      <FiClock size={16} />
                      Iniciar
                    </Button>
                  )}
                  {task.status !== "done" && task.status !== "cancelled" && (
                    <Button
                      variant="primary"
                      disabled={loading}
                      onClick={() => void changeStatus(task, "done")}
                    >
                      <FiCheck size={16} />
                      Concluir
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
