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
          onClick={handleLogout}
        >
          Sair
        </Button>
        <div className="company-brand">
          <img
            src="/src/img/HIDRODEMA_LogoNovo_Branco (2).png"
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
          title="Hidro"
          subtitle="Service"
          description="Engenharia de aplicaçao e serviços Hidrodema"
          backgroundColor="#f5f5f5"
          textColor="#333"
          size="large"
          onClick={() => handleCardClick(paths.service)}
        />
        <Card
          variant="technology"
          title="Hidro"
          subtitle="meeting"
          description="Tecnologia em termoplasticos industriais"
          backgroundColor="#2c5f5f"
          textColor="#fff"
          size="large"
          onClick={() => handleCardClick(paths.meeting)}
        />
        <Card
          variant="marketing"
          title="Marketing"
          description="Gerencie seu marketing"
          backgroundColor="#fff"
          textColor="#000"
          size="large"
          onClick={() => handleCardClick(paths.marketing)}
        />
      </div>
      <div className="menu-footer">
        <Button
          variant="secondary"
          onClick={() => handleCardClick(paths.acessoExclusivo)}
        >
          Acesso Exclusivo
        </Button>
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
