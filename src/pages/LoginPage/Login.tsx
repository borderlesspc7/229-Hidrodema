import React, { useState, useEffect } from "react";
import "./Login.css";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { paths } from "../../routes/paths";
import { SESSION_EXPIRED_MESSAGE } from "../../services/authService";

export default function Login() {
  const {
    login,
    sendPasswordRecovery,
    logout,
    loading: authLoading,
    error: authError,
    clearError,
    user,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  useEffect(() => {
    const state = location.state as { sessionExpired?: boolean; message?: string } | null;
    if (state?.sessionExpired) {
      setSessionMessage(state.message || SESSION_EXPIRED_MESSAGE);
      // clear state so refresh/back doesn't keep message forever
      navigate(paths.login, { replace: true, state: null });
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLocalError(null);
    clearError();
    if (!formData.email.trim() || !formData.password) {
      setLocalError("Informe email e senha para continuar.");
      return;
    }

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

  const openRecovery = () => {
    setRecoveryEmail(formData.email);
    setRecoverySent(false);
    setRecoveryOpen(true);
    setLocalError(null);
    clearError();
  };

  const closeRecovery = () => {
    setRecoveryOpen(false);
  };

  const submitRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    try {
      await sendPasswordRecovery(recoveryEmail);
      setRecoverySent(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login-page hd-page-bg">
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

        {user ? (
          <div style={{ marginBottom: 12 }}>
            <div className="error-message" style={{ marginBottom: 10 }}>
              Você já está logado como <strong>{user.email}</strong>. Para testar outro perfil,
              saia abaixo.
            </div>
            <Button
              type="button"
              variant="secondary"
              className="button--full-width"
              onClick={() => navigate(paths.menu, { replace: true })}
            >
              Ir para o Menu
            </Button>
            <div style={{ height: 8 }} />
            <Button
              type="button"
              variant="primary"
              className="button--full-width"
              onClick={() => void logout()}
            >
              Sair (limpar sessão)
            </Button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="login-form">
          {sessionMessage ? (
            <div className="error-message" style={{ marginBottom: 12 }}>
              {sessionMessage}
            </div>
          ) : null}
          {localError ? (
            <div className="error-message" style={{ marginBottom: 12 }}>
              {localError}
            </div>
          ) : null}
          <Input
            type="email"
            variant="auth"
            label="Email"
            placeholder="ex: seu@email.com"
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
            error={Boolean(localError) && !formData.email.trim()}
            helperText={
              Boolean(localError) && !formData.email.trim()
                ? "O email é obrigatório."
                : undefined
            }
          />
          <Input
            type="password"
            variant="auth"
            label="Senha"
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={(value) => handleChange("password", value)}
            error={Boolean(localError) && !formData.password}
            helperText={
              Boolean(localError) && !formData.password
                ? "A senha é obrigatória."
                : undefined
            }
          />
          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" id="remember" />
              <span className="checkmark"></span>
              <span>Lembrar-me</span>
            </label>
            <button
              type="button"
              className="forgot-password"
              onClick={openRecovery}
            >
              Esqueceu sua senha?
            </button>
          </div>

          <Button
            variant="primary"
            className="button--full-width"
            type="submit"
            disabled={authLoading || Boolean(user)}
          >
            {authLoading ? "Carregando..." : "Entrar"}
          </Button>

          {authError && <p className="error-message">{authError}</p>}
        </form>

        <div className="auth-toggle">
          <span>Não tem uma conta?</span>
          <Link to={paths.register} className="toggle-button">
            Criar conta
          </Link>
        </div>
      </div>

      {recoveryOpen ? (
        <div className="recovery-overlay" role="dialog" aria-modal="true">
          <div className="recovery-modal hd-scale-in">
            <div className="recovery-header">
              <h2>Recuperar senha</h2>
              <Button variant="icon" onClick={closeRecovery} aria-label="Fechar">
                ✕
              </Button>
            </div>
            {recoverySent ? (
              <div className="recovery-body">
                <p className="recovery-success">
                  Se o email existir, enviamos um link de recuperação.
                </p>
                <Button variant="secondary" className="button--full-width" onClick={closeRecovery}>
                  Ok
                </Button>
              </div>
            ) : (
              <form onSubmit={submitRecovery} className="recovery-body">
                <Input
                  type="email"
                  placeholder="Digite seu email"
                  value={recoveryEmail}
                  onChange={setRecoveryEmail}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="button--full-width"
                  disabled={authLoading}
                >
                  Enviar link
                </Button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
