import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { paths } from "../../../routes/paths";
import BackButton from "../../../components/ui/BackButton/BackButton";
import Card from "../../../components/ui/Card/Card";
import { hasMacroVisibility } from "../../../lib/rbac";
import { getPerformanceKpis } from "../../../services/cloudFunctionsService";
import "./DashboardPerformance.css";

export default function DashboardPerformance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof getPerformanceKpis>> | null>(
    null
  );

  const canView = useMemo(() => Boolean(user && hasMacroVisibility(user)), [user]);

  useEffect(() => {
    if (!user) {
      navigate(paths.menu);
      return;
    }
    if (!canView) {
      navigate(paths.acessoExclusivo);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPerformanceKpis();
        if (!alive) return;
        setKpis(data);
      } catch (e) {
        if (!alive) return;
        setError(String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user, canView, navigate]);

  return (
    <div className="dashboard-performance hd-page-bg">
      <header className="dashboard-performance__header">
        <BackButton
          fallbackPath={paths.acessoExclusivo}
          className="dashboard-performance__back"
        />
        <h1 className="dashboard-performance__title">Dashboard do time</h1>
        <div className="dashboard-performance__spacer" />
      </header>

      <section className="dashboard-performance__panel">
        <p className="dashboard-performance__hint">
          Indicadores consolidados (janela padrão de 30 dias), com cache de 5 minutos.
        </p>
        {loading && <p className="dashboard-performance__muted">Carregando…</p>}
        {error && <p className="dashboard-performance__err">{error}</p>}
      </section>

      {kpis && (
        <div className="dashboard-performance__grid">
          <Card
            variant="technology"
            title="SOLICITAÇÕES DE VISITA"
            size="medium"
            textColor="#e2e8f0"
            className="dashboard-performance__card"
            onClick={() => navigate("/acesso-exclusivo/relatorio-visitas")}
          >
            <div className="dashboard-performance__metric">{kpis.visitRequests}</div>
          </Card>

          <Card
            variant="technology"
            title="RELATÓRIOS DE VISITA"
            size="medium"
            textColor="#e2e8f0"
            className="dashboard-performance__card"
            onClick={() => navigate("/acesso-exclusivo/relatorio-visitas")}
          >
            <div className="dashboard-performance__metric">{kpis.visitReports}</div>
          </Card>

          <Card
            variant="technology"
            title="SOLICITAÇÕES DE SERVIÇO"
            size="medium"
            textColor="#e2e8f0"
            className="dashboard-performance__card"
            onClick={() => navigate("/acesso-exclusivo/solicitacao-servicos")}
          >
            <div className="dashboard-performance__metric">{kpis.serviceRequests}</div>
          </Card>

          <Card
            variant="technology"
            title="MDS (SERVIÇOS)"
            size="medium"
            textColor="#e2e8f0"
            className="dashboard-performance__card"
            onClick={() => navigate("/acesso-exclusivo/equalizador-servico")}
          >
            <div className="dashboard-performance__metric">{kpis.serviceMds}</div>
          </Card>
        </div>
      )}
    </div>
  );
}

