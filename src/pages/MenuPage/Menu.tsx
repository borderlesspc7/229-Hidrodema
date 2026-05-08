import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import "./Menu.css";
import Card from "../../components/ui/Card/Card";

export default function Menu() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePublicClick = (path: string) => navigate(path);
  const handleExclusiveClick = () => {
    navigate(user ? paths.acessoExclusivo : paths.login);
  };

  return (
    <div className="menu-container">
      <div className="menu-topbar">
        <div className="menu-brand-top">
          <div className="menu-title">HIDRODEMA</div>
          <div className="menu-title-underline" />
        </div>
      </div>

      <div className="menu-home">
        <div className="menu-home-cards">
          <Card
            variant="service"
            title="HIDRO SERVICE"
            subtitle={"Engenharia de aplicação e serviços\nHidrodema"}
            backgroundColor="rgba(7, 16, 33, 0.55)"
            textColor="rgba(226, 232, 240, 0.96)"
            size="large"
            className="menu-home-card"
            onClick={() => handlePublicClick(paths.service)}
          />
        </div>

        <button
          type="button"
          className="menu-home-access"
          onClick={handleExclusiveClick}
        >
          Acesso Exclusivo
        </button>
      </div>
    </div>
  );
}
