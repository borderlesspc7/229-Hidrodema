import React from "react";
import "./AuthLayout.css";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__overlay" aria-hidden="true" />
      <div className="auth-layout__grid" aria-hidden="true" />

      <div className="auth-layout__brand">
        <img
          src="/HIDRODEMA_LogoNovo_Branco (2).png"
          alt="HIDRODEMA"
          className="auth-layout__logo"
        />
        <div className="auth-layout__underline" />
      </div>

      <div className="auth-layout__content">{children}</div>
    </div>
  );
}
