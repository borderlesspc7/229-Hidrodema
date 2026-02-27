import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AuthInputField from "../AuthInputField/AuthInputField";
import { paths } from "../../../routes/paths";
import "../Auth.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onForgotPassword?: () => void;
  sessionExpiredMessage?: string | null;
}

export default function LoginForm({
  onSubmit,
  loading = false,
  error: externalError = null,
  onForgotPassword,
  sessionExpiredMessage,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailError = touched.email
    ? !email.trim()
      ? "Email é obrigatório"
      : !EMAIL_REGEX.test(email.trim())
        ? "Digite um email válido"
        : null
    : null;

  const passwordError = touched.password
    ? !password
      ? "Senha é obrigatória"
      : password.length < MIN_PASSWORD_LENGTH
        ? "A senha deve ter no mínimo 6 caracteres"
        : null
    : null;

  const isInvalid =
    !!emailError ||
    !!passwordError ||
    !email.trim() ||
    !password ||
    password.length < MIN_PASSWORD_LENGTH;

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setTouched({ email: true, password: true });
      setSubmitError(null);

      if (emailError || passwordError || isInvalid) return;

      try {
        await onSubmit(email.trim(), password);
      } catch (err) {
        setSubmitError((err as Error).message);
      }
    },
    [email, password, emailError, passwordError, isInvalid, onSubmit]
  );

  const displayError = externalError || submitError;

  return (
    <>
      {sessionExpiredMessage && (
        <div className="auth-message auth-message--error" role="alert">
          {sessionExpiredMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <AuthInputField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          placeholder="ex: seu@email.com"
          error={emailError ?? undefined}
          required
          disabled={loading}
          autoComplete="email"
        />

        <AuthInputField
          id="login-password"
          label="Senha"
          type="password"
          value={password}
          onChange={setPassword}
          onBlur={() => setTouched((p) => ({ ...p, password: true }))}
          placeholder="Mínimo 6 caracteres"
          error={passwordError ?? undefined}
          required
          disabled={loading}
          autoComplete="current-password"
        />

        <div className="auth-form-options">
          <label className="auth-terms" style={{ cursor: "pointer", margin: 0 }}>
            <input type="checkbox" className="auth-terms__input" id="remember" />
            <span className="auth-terms__text">Lembrar-me</span>
          </label>
          {onForgotPassword && (
            <button
              type="button"
              className="auth-form-options__link"
              onClick={onForgotPassword}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                font: "inherit",
              }}
            >
              Esqueceu sua senha?
            </button>
          )}
        </div>

        <div className="auth-form__submit">
          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading || isInvalid}
            aria-busy={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        {displayError && (
          <p className="auth-message auth-message--error" role="alert">
            {displayError}
          </p>
        )}
      </form>

      <div className="auth-toggle">
        <span className="auth-toggle__text">Não tem uma conta?</span>
        <Link to={paths.register} className="auth-toggle__link">
          Criar conta
        </Link>
      </div>
    </>
  );
}
