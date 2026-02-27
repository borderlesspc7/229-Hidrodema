import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import "./Menu.css";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import { useState } from "react";
import Toast from "../../components/ui/Toast/Toast";

export default function Menu() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const handleLogout = async () => {
    try {
      await logout();
      navigate(paths.login);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleCardClick = (path: string) => {
    if (!user) {
      setToastMessage("Voce Precisa Estar Logado");
      setToastType("error");
      setShowToast(true);
      return;
    } else {
      navigate(path);
    }
  };

  return (
    <div className="menu-container">
      <div className="menu-header">
        <Button
          variant="secondary"
          className="logout-button-left"
          onClick={user ? handleLogout : () => navigate(paths.login)}
        >
          {user ? "Sair" : "Login"}
        </Button>
        <div className="company-brand">
          <img
            src="/HIDRODEMA_LogoNovo_Branco (2).png"
            alt="HIDRODEMA"
            className="company-logo"
          />
          <div className="company-underline"></div>
        </div>
        <div className="header-spacer"></div>
      </div>
      <div className="menu-cards">
        <Card
          variant="service"
          title="HIDRO SERVICE"
          description="Engenharia de aplicação e serviços Hidrodema"
          backgroundColor="#1a2f4a"
          textColor="#ffffff"
          size="large"
          onClick={() => navigate(paths.service)}
        />
        <Card
          variant="technology"
          title="HIDRO MEETING"
          description="Tecnologia em termoplásticos industriais"
          backgroundColor="#1e4d4d"
          textColor="#ffffff"
          size="large"
          onClick={() => handleCardClick(paths.meeting)}
        />
        <Card
          variant="marketing"
          title="MARKETING"
          description="Gerencie seu marketing"
          backgroundColor="#252d3d"
          textColor="#ffffff"
          size="large"
          onClick={() => handleCardClick(paths.marketing)}
        />
      </div>
      <div className="menu-footer">
        <button
          type="button"
          className="menu-footer__btn"
          onClick={() => handleCardClick(paths.acessoExclusivo)}
        >
          Acesso Exclusivo
        </button>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={10000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
