import "./AcessoExclusivo.css";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import Card from "../../components/ui/Card/Card";
import { features } from "../../lib/features";
import { hasMacroVisibility, isAdmin } from "../../lib/rbac";
import BackButton from "../../components/ui/BackButton/BackButton";

export default function AcessoExclusivo() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate(paths.menu);
  }, [user, navigate]);

  return (
    <div className="acesso-exclusivo-container hd-page-bg">
      <div className="hidro-service-header">
        <BackButton fallbackPath={paths.menu} className="logout-button-left" />
        <div className="acesso-exclusivo-company-brand">
          <img
            src="/Logo HidroService.png"
            alt="HIDRO SERVICE"
            className="acesso-exclusivo-logo"
          />
          <div className="acesso-exclusivo-company-underline"></div>
        </div>
        <div className="acesso-exclusivo-header-spacer"></div>
      </div>

      <div className="acesso-exclusivo-content">
        <h2 className="acesso-exclusivo-content-title">ACESSO EXCLUSIVO</h2>
        <Card
          variant="technology"
          title="RELATORIO DE VISITAS"
          textColor="#e2e8f0"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/relatorio-visitas")}
        />
        <Card
          variant="technology"
          title="GERENCIAMENTO DE OBRAS"
          textColor="#e2e8f0"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/gerenciamento-obras")}
        />
        <Card
          variant="technology"
          title="EQUALIZADOR DE SERVICOS"
          textColor="#e2e8f0"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/equalizador-servico")}
        />
        <Card
          variant="technology"
          title="SOLICITACAO DE SERVICOS"
          textColor="#e2e8f0"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/solicitacao-servicos")}
        />
        {features.gestaoVendedores && user && hasMacroVisibility(user) && (
          <Card
            variant="technology"
            title="GESTAO DE VENDEDORES (API)"
            textColor="#e2e8f0"
            size="medium"
            className="acesso-exclusivo-card"
            onClick={() => navigate("/acesso-exclusivo/gestao-vendedores")}
          />
        )}
        {user && isAdmin(user) && (
          <Card
            variant="technology"
            title="CONTROLE DE FUNCIONARIOS"
            textColor="#e2e8f0"
            size="medium"
            className="acesso-exclusivo-card"
            onClick={() => navigate("/acesso-exclusivo/controle-funcionarios")}
          />
        )}
      </div>

      <div className="acesso-exclusivo-footer">
        <img
          src="/HIDRODEMA_LogoNovo_Branco (2).png"
          alt="HIDRODEMA"
          className="acesso-exclusivo-footer-logo"
        />
      </div>
    </div>
  );
}
