import { useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Card from "../../../components/ui/Card/Card";
import "./CursoSenaiRedirect.css";

const SENAI_URL = "https://www.senai.br/cursos/hidroservice";

export default function CursoSenaiRedirect() {
  useEffect(() => {
    window.location.assign(SENAI_URL);
  }, []);

  return (
    <div className="curso-senai-redirect-page hd-page-bg">
      <Card
        variant="service"
        title=""
        textColor="#1e293b"
        className="curso-senai-redirect-card"
      >
        <h2>Redirecionando para o SENAI…</h2>
        <p>
          Se não abrir automaticamente, clique no botão abaixo (ou{" "}
          <Link to="/">volte</Link>).
        </p>
        <div className="curso-senai-redirect-actions">
          <Button
            variant="primary"
            onClick={() => window.open(SENAI_URL, "_blank", "noopener,noreferrer")}
          >
            Abrir SENAI da Empresa
          </Button>
        </div>
      </Card>
    </div>
  );
}

