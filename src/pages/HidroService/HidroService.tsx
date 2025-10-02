import "./HidroService.css";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import Button from "../../components/ui/Button/Button";
import Card from "../../components/ui/Card/Card";

export default function HidroService() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate(paths.menu);
  }, [user, navigate]);

  const handleBack = () => {
    navigate(paths.menu);
  };

  return (
    <div className="hidro-service-container">
      <div className="hidro-service-header">
        <Button
          variant="secondary"
          className="logout-button-left"
          onClick={handleBack}
        >
          Voltar
        </Button>
        <div className="hidro-service-company-brand">
          <img
            src="/src/img/Logo HidroService.png"
            alt="HIDRO SERVICE"
            className="hidro-service-logo"
          />
          <div className="hidro-service-company-underline"></div>
        </div>
        <div className="hidro-service-header-spacer"></div>
      </div>

      <div className="hidro-service-content">
        <Card
          variant="service"
          title="RESISTENCIA QUIMICA"
          backgroundColor="#f5f5f5"
          textColor="#333"
          size="medium"
          className="hidro-service-card"
          onClick={() => navigate("/service/resistencia-quimica")}
        />
        <Card
          variant="service"
          title="ESPACAMENTO DE SUPORTES"
          backgroundColor="#f5f5f5"
          textColor="#333"
          size="medium"
          className="hidro-service-card"
          onClick={() => navigate("/service/espacamento-suportes")}
        />
        <Card
          variant="service"
          title="CONSUMO DE ADESIVO"
          backgroundColor="#f5f5f5"
          textColor="#333"
          size="medium"
          className="hidro-service-card"
          onClick={() => navigate("/service/consumo-adesivo")}
        />
        <Card
          variant="service"
          title="PESO TERMOPLASTICOS"
          backgroundColor="#f5f5f5"
          textColor="#333"
          size="medium"
          className="hidro-service-card"
          onClick={() => navigate("/service/peso-termoplasticos")}
        />
        <Card
          variant="service"
          title="CURSO SENAI"
          backgroundColor="#f5f5f5"
          textColor="#333"
          size="medium"
          className="hidro-service-card"
          onClick={() =>
            window.open("https://www.senai.br/cursos/hidroservice", "_blank")
          }
        />
      </div>

      <div className="hidro-service-footer">
        <div>
          <img
            src="/src/img/HIDRODEMA_LogoNovo_branco (2).png"
            alt="HIDRODEMA"
            className="hidro-service-footer-logo"
          />
        </div>
        <div className="hidro-service-footer-spacer"></div>
        <div>
          <Button onClick={() => navigate(paths.acessoExclusivo)}>
            Acesso Exclusivo
          </Button>
        </div>
      </div>
    </div>
  );
}
