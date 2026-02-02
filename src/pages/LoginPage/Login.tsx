import React, { useState, useEffect } from "react";
import "./Login.css";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { paths } from "../../routes/paths";
import { authService } from "../../services/authService";

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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Estados do modal de recuperação de senha
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  // Redireciona para o menu se já estiver logado
  useEffect(() => {
    if (user) {
      navigate(paths.menu);
    }
  }, [user, navigate]);

  // Limpa a mensagem de sessão expirada ao sair da página de login
  useEffect(() => {
    return () => clearSessionExpiredMessage();
  }, [clearSessionExpiredMessage]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearSessionExpiredMessage();

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowResetModal(true);
    setResetSuccess(false);
    setResetError("");
    setResetEmail(formData.email); // Preenche com o email do formulário se houver
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (error) {
      setResetError((error as Error).message);
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
    <div className="login-page">
      {/* Título da Empresa */}
      <div className="company-brand">
        <img
          src="/HIDRODEMA_LogoNovo_Branco (2).png"
          alt="HIDRODEMA"
          className="company-logo"
        />
        <div className="company-underline"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        {sessionExpiredMessage && (
          <div className="session-expired-message" role="alert">
            {sessionExpiredMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            type="email"
            placeholder="Digite seu email"
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
          />
          <Input
            type="password"
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={(value) => handleChange("password", value)}
          />
          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" id="remember" />
              <span className="checkmark"></span>
              <span>Lembrar-me</span>
            </label>
            <a
              href="#"
              className="forgot-password"
              onClick={handleForgotPassword}
            >
              Esqueceu sua senha?
            </a>
          </div>

          <Button
            variant="primary"
            className="button--full-width"
            type="submit"
            disabled={authLoading}
          >
            {authLoading ? "Carregando..." : "Entrar"}
          </Button>

          {authError && <p className="error-message">{authError}</p>}
        </form>

        <div className="auth-divider">
          <div className="divider-line"></div>
          <span>ou</span>
          <div className="divider-line"></div>
        </div>

        <Button
          onClick={() => navigate(paths.menu)}
          variant="secondary"
          className="button--full-width"
        >
          Entrar sem login
        </Button>

        <div className="auth-toggle">
          <span>Não tem uma conta?</span>
          <Link to={paths.register} className="toggle-button">
            Criar conta
          </Link>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      {showResetModal && (
        <div className="modal-overlay" onClick={closeResetModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Recuperar Senha</h2>
              <button
                className="modal-close-button"
                onClick={closeResetModal}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {!resetSuccess ? (
                <>
                  <p className="modal-description">
                    Digite seu email cadastrado e enviaremos um link para
                    redefinir sua senha.
                  </p>

                  <form onSubmit={handleResetPassword} className="reset-form">
                    <Input
                      type="email"
                      placeholder="Digite seu email"
                      value={resetEmail}
                      onChange={setResetEmail}
                    />

                    {resetError && (
                      <p className="error-message">{resetError}</p>
                    )}

                    <div className="modal-actions">
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
                        disabled={resetLoading || !resetEmail}
                      >
                        {resetLoading ? "Enviando..." : "Enviar Email"}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="success-message-container">
                  <div className="success-icon">✓</div>
                  <h3 className="success-title">Email Enviado!</h3>
                  <p className="success-description">
                    Verifique sua caixa de entrada e siga as instruções para
                    redefinir sua senha.
                  </p>
                  <p className="success-note">
                    Se não encontrar o email, verifique sua caixa de spam.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
