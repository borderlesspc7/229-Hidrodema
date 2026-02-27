import React, { useState, useEffect } from "react";
import AuthLayout from "../../components/auth/AuthLayout/AuthLayout";
import LoginForm from "../../components/auth/LoginForm/LoginForm";
import AuthInputField from "../../components/auth/AuthInputField/AuthInputField";
import Button from "../../components/ui/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import { authService } from "../../services/authService";
import "../../components/auth/Auth.css";
import "../../components/auth/AuthModal/AuthModal.css";

export default function Login() {
  const {
    login,
    loading: authLoading,
    error: authError,
    user,
    sessionExpiredMessage,
    clearSessionExpiredMessage,
  } = useAuth();
  const navigate = useNavigate();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    if (user) navigate(paths.menu);
  }, [user, navigate]);

  useEffect(() => {
    return () => clearSessionExpiredMessage();
  }, [clearSessionExpiredMessage]);

  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
  };

  const handleForgotPassword = () => {
    setShowResetModal(true);
    setResetSuccess(false);
    setResetError("");
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetSuccess(false);
    try {
      await authService.resetPassword(resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setShowResetModal(false);
        setResetEmail("");
        setResetSuccess(false);
      }, 3000);
    } catch (err) {
      setResetError((err as Error).message);
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail("");
    setResetError("");
    setResetSuccess(false);
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        <LoginForm
          onSubmit={handleLogin}
          loading={authLoading}
          error={authError}
          onForgotPassword={handleForgotPassword}
          sessionExpiredMessage={sessionExpiredMessage}
        />
      </div>

      {showResetModal && (
        <div
          className="auth-modal-overlay"
          onClick={closeResetModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div
            className="auth-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal-header">
              <h2 id="auth-modal-title" className="auth-modal-title">
                Recuperar Senha
              </h2>
              <button
                type="button"
                className="auth-modal-close"
                onClick={closeResetModal}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="auth-modal-body">
              {!resetSuccess ? (
                <>
                  <p className="auth-modal-description">
                    Digite seu email cadastrado e enviaremos um link para
                    redefinir sua senha.
                  </p>

                  <form
                    onSubmit={handleResetSubmit}
                    className="auth-modal-form"
                    noValidate
                  >
                    <AuthInputField
                      id="reset-email"
                      label="Email"
                      type="email"
                      value={resetEmail}
                      onChange={setResetEmail}
                      placeholder="seu@email.com"
                      required
                      disabled={resetLoading}
                      autoComplete="email"
                    />

                    {resetError && (
                      <p className="auth-message auth-message--error" role="alert">
                        {resetError}
                      </p>
                    )}

                    <div className="auth-modal-actions">
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={closeResetModal}
                        disabled={resetLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={resetLoading || !resetEmail.trim()}
                      >
                        {resetLoading ? "Enviando..." : "Enviar Email"}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="auth-modal-success">
                  <div className="auth-modal-success-icon">✓</div>
                  <h3 className="auth-modal-success-title">Email Enviado!</h3>
                  <p className="auth-modal-success-desc">
                    Verifique sua caixa de entrada e siga as instruções para
                    redefinir sua senha.
                  </p>
                  <p className="auth-modal-success-note">
                    Se não encontrar o email, verifique sua caixa de spam.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
