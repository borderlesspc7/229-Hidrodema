import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AuthInputField from "../AuthInputField/AuthInputField";
import { paths } from "../../../routes/paths";
import "../Auth.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export interface RegisterFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export default function RegisterForm({
  onSubmit,
  loading = false,
  error: externalError = null,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nameError = touched.name
    ? !name.trim()
      ? "Nome é obrigatório"
      : null
    : null;

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

  const confirmError = touched.confirmPassword
    ? !confirmPassword
      ? "Confirme sua senha"
      : confirmPassword !== password
        ? "As senhas não coincidem"
        : null
    : null;

  const termsError = touched.terms && !agreedToTerms;

  const isInvalid =
    !!nameError ||
    !!emailError ||
    !!passwordError ||
    !!confirmError ||
    !name.trim() ||
    !email.trim() ||
    !password ||
    password.length < MIN_PASSWORD_LENGTH ||
    confirmPassword !== password ||
    !agreedToTerms;

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
        terms: true,
      });
      setSubmitError(null);

      if (
        nameError ||
        emailError ||
        passwordError ||
        confirmError ||
        !agreedToTerms ||
        isInvalid
      )
        return;

      try {
        await onSubmit({
          name: name.trim(),
          email: email.trim(),
          password,
        });
      } catch (err) {
        setSubmitError((err as Error).message);
      }
    },
    [
      name,
      email,
      password,
      confirmPassword,
      agreedToTerms,
      nameError,
      emailError,
      passwordError,
      confirmError,
      isInvalid,
      onSubmit,
    ]
  );

  const displayError = externalError || submitError;

  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <AuthInputField
          id="register-name"
          label="Nome completo"
          type="text"
          value={name}
          onChange={setName}
          onBlur={() => setTouched((p) => ({ ...p, name: true }))}
          placeholder="Digite seu nome completo"
          error={nameError ?? undefined}
          required
          disabled={loading}
          autoComplete="name"
        />

        <AuthInputField
          id="register-email"
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
          id="register-password"
          label="Senha"
          type="password"
          value={password}
          onChange={setPassword}
          onBlur={() => setTouched((p) => ({ ...p, password: true }))}
          placeholder="Mínimo 6 caracteres"
          error={passwordError ?? undefined}
          required
          disabled={loading}
          autoComplete="new-password"
        />

        <AuthInputField
          id="register-confirm"
          label="Confirmar senha"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
          placeholder="Repita a senha"
          error={confirmError ?? undefined}
          required
          disabled={loading}
          autoComplete="new-password"
        />

        <label
          className="auth-terms"
          onBlur={() => setTouched((p) => ({ ...p, terms: true }))}
        >
          <input
            type="checkbox"
            className="auth-terms__input"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            disabled={loading}
            aria-invalid={termsError}
          />
          <span className="auth-terms__text">
            Eu concordo com os{" "}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Termos de uso
            </a>{" "}
            e a{" "}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Política de privacidade
            </a>
          </span>
        </label>
        {termsError && (
          <p className="auth-form__field-error" role="alert">
            É necessário aceitar os termos e a política de privacidade.
          </p>
        )}

        <div className="auth-form__submit">
          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading || isInvalid}
            aria-busy={loading}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </div>

        {displayError && (
          <p className="auth-message auth-message--error" role="alert">
            {displayError}
          </p>
        )}
      </form>

      <div className="auth-toggle">
        <span className="auth-toggle__text">Já tem uma conta?</span>
        <Link to={paths.login} className="auth-toggle__link">
          Fazer login
        </Link>
      </div>
    </>
  );
}
