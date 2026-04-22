import type { ReactNode } from "react";
import { paths } from "../../../routes/paths";
import BackButton from "../../../components/ui/BackButton/BackButton";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function ObrasSubmoduleLayout({ title, subtitle, children }: Props) {
  return (
    <div className="obras-container">
      <div className="obras-header">
        <BackButton fallbackPath={paths.obras.base} className="obras-back-button" />
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
