import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import "./Menu.css";
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
      <div className="menu-topbar">
        <button type="button" className="menu-back" onClick={() => void handleLogout()}>
          VOLTAR
        </button>

        <div className="menu-breadcrumb" aria-label="Breadcrumb">
          <span className="menu-breadcrumb__home" aria-hidden="true">
            ⌂
          </span>
          <span className="menu-breadcrumb__pill">Acesso Exclusivo</span>
        </div>

        <div className="menu-topbar-spacer" />
      </div>

      <div className="menu-center">
        <div className="menu-brand">
          <img src="/Logo HidroService.png" alt="HIDRO SERVICE" className="menu-brand__logo" />
          <div className="menu-brand__underline" />
        </div>

        <div className="menu-block">
          <div className="menu-block__title">ACESSO EXCLUSIVO</div>
          <div className="menu-block__actions">
            <button
              type="button"
              className="menu-pill"
              onClick={() => handleCardClick("/acesso-exclusivo/relatorio-visitas")}
            >
              RELATÓRIO DE VISITAS
            </button>
            <button
              type="button"
              className="menu-pill"
              onClick={() => handleCardClick("/acesso-exclusivo/gerenciamento-obras")}
            >
              GERENCIAMENTO DE OBRAS
            </button>
            <button
              type="button"
              className="menu-pill"
              onClick={() => handleCardClick("/acesso-exclusivo/equalizador-servico")}
            >
              EQUALIZADOR DE SERVIÇOS
            </button>
            <button
              type="button"
              className="menu-pill"
              onClick={() => handleCardClick("/acesso-exclusivo/solicitacao-servicos")}
            >
              SOLICITAÇÃO DE SERVIÇOS
            </button>
          </div>
        </div>
      </div>

      <div className="menu-watermark" aria-hidden="true">
        HIDRODEMA
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
