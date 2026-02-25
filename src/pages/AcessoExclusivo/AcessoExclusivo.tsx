import "./AcessoExclusivo.css";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import Button from "../../components/ui/Button/Button";
import Card from "../../components/ui/Card/Card";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";

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
      {/* Breadcrumb */}
      <Breadcrumb />

      <div className="hidro-service-header">
        <Button
          variant="secondary"
          className="logout-button-left"
          onClick={handleBack}
        >
          Voltar
        </Button>
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
          variant="service"
          title="RELATÓRIO DE VISITAS"
          textColor="#ffffff"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/relatorio-visitas")}
        />
        <Card
          variant="service"
          title="GERENCIAMENTO DE OBRAS"
          textColor="#ffffff"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/gerenciamento-obras")}
        />
        <Card
          variant="service"
          title="EQUALIZADOR DE SERVIÇOS"
          textColor="#ffffff"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/equalizador-servico")}
        />
        <Card
          variant="service"
          title="SOLICITAÇÃO DE SERVIÇOS"
          textColor="#ffffff"
          size="medium"
          className="acesso-exclusivo-card"
          onClick={() => navigate("/acesso-exclusivo/solicitacao-servicos")}
        />
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
