import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import { FiArrowLeft } from "react-icons/fi";
import { paths } from "../../../routes/paths";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function ObrasSubmoduleLayout({ title, subtitle, children }: Props) {
  const navigate = useNavigate();

  return (
    <div className="obras-container">
      <div className="obras-header">
        <Button
          variant="secondary"
          className="obras-back-button"
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate(paths.obras.base);
          }}
        >
          <FiArrowLeft size={16} />
          Voltar
        </Button>
        <div className="obras-company-brand">
          <h1 className="obras-company-title">{title}</h1>
          <span className="obras-company-subtitle">{subtitle}</span>
          <div className="obras-company-underline"></div>
        </div>
        <div className="obras-header-spacer"></div>
      </div>
      {children}
      <div className="obras-footer">
        <img
          src="/HIDRODEMA_LogoNovo_Branco (2).png"
          alt="HIDRODEMA"
          className="obras-footer-logo"
        />
      </div>
    </div>
  );
}
