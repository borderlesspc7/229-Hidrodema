import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import "./Menu.css";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";

export default function Menu() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(paths.login);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
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
          <h1 className="company-title">HIDRODEMA</h1>
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
        />
        <Card
          variant="technology"
          title="Hidro"
          subtitle="meeting"
          description="Tecnologia em termoplasticos industriais"
          backgroundColor="#2c5f5f"
          textColor="#fff"
          size="large"
        />
        <Card
          variant="marketing"
          title="Marketing"
          description="Gerencie seu marketing"
          backgroundColor="#fff"
          textColor="#000"
          size="large"
        />
      </div>
      <div className="menu-footer">
        <Button onClick={() => navigate(paths.acessoExclusivo)}>
          Acesso Exclusivo
        </Button>
      </div>
    </div>
  );
}
