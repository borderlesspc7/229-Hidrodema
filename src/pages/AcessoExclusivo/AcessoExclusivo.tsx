import "./AcessoExclusivo.css";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import Button from "../../components/ui/Button/Button";
import Card from "../../components/ui/Card/Card";

export default function AcessoExclusivo() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate(paths.menu);
  }, [user, navigate]);

  const handleBack = () => {
    navigate(paths.service);
  };

  return (
    <div className="acesso-exclusivo-container">
      <div className="hidro-service-header">
        <Button
          variant="secondary"
          className="logout-button-left"
          onClick={handleBack}
        >
          Voltar
        </Button>
        <div className="acesso-exclusivo-company-brand">
          <h1 className="acesso-exclusivo-company-title">HIDRO SERVICE</h1>
          <span className="acesso-exclusivo-company-subtitle">
            Engenharia de aplicaçao e serviços Hidrodema
          </span>
          <div className="acesso-exclusivo-company-underline"></div>
        </div>
        <div className="acesso-exclusivo-header-spacer"></div>
      </div>

      <div className="acesso-exclusivo-content">
        <h2 className="acesso-exclusivo-content-title">ACESSO EXCLUSIVO</h2>
        <Card
          variant="service"
          title="RELATORIO DE VISITAS"
          backgroundColor="#f5f5f5"
          textColor="#333"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/relatorio-visitas")}
        />
        <Card
          variant="service"
          title="GERENCIAMENTO DE OBRAS"
          backgroundColor="#f5f5f5"
          textColor="#333"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/gerenciamento-obras")}
        />
        <Card
          variant="service"
          title="EQUALIZADOR DE SERVICOS"
          backgroundColor="#f5f5f5"
          textColor="#333"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/equalizador-servicos")}
        />
        <Card
          variant="service"
          title="SOLICITACAO DE SERVICOS"
          backgroundColor="#f5f5f5"
          textColor="#333"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/solicitacao-servicos")}
        />
      </div>

      <div className="acesso-exclusivo-footer">
        <span className="acesso-exclusivo-footer-company-subtitle">
          HIDRODEMA
        </span>
      </div>
    </div>
  );
}
