import React, { useState, useEffect } from "react";
import "./Register.css";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { paths } from "../../routes/paths";

export default function Register() {
  const { register, loading: authLoading, error: authError, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  // Redireciona para o menu se já estiver logado
  useEffect(() => {
    if (user) {
      navigate(paths.menu, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.confirmPassword !== formData.password) {
      setLocalError("As senhas não coincidem.");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!formData.name.trim()) {
      setLocalError("O nome é obrigatório.");
      return;
    }

    if (!formData.email.trim()) {
      setLocalError("O email é obrigatório.");
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: "user", // Define role padrão
      });
    } catch (error) {
      console.error("Erro no registro:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="register-page">
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
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">
            Preencha os dados para criar sua nova conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {localError ? <p className="error-message">{localError}</p> : null}
          <Input
            type="text"
            placeholder="Digite seu nome completo"
            value={formData.name}
            onChange={(value) => handleChange("name", value)}
            required
            error={Boolean(localError) && !formData.name.trim()}
          />
          <Input
            type="email"
            placeholder="Digite seu email"
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
            required
            error={Boolean(localError) && !formData.email.trim()}
          />
          <Input
            type="password"
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={(value) => handleChange("password", value)}
            required
            error={Boolean(localError) && formData.password.length > 0 && formData.password.length < 6}
            helperText={
              formData.password.length > 0 && formData.password.length < 6
                ? "Mínimo de 6 caracteres."
                : undefined
            }
          />
          <Input
            type="password"
            placeholder="Confirme sua senha"
            value={formData.confirmPassword}
            onChange={(value) => handleChange("confirmPassword", value)}
            required
            error={
              Boolean(localError) &&
              Boolean(formData.confirmPassword) &&
              formData.confirmPassword !== formData.password
            }
            helperText={
              Boolean(formData.confirmPassword) &&
              formData.confirmPassword !== formData.password
                ? "As senhas precisam ser iguais."
                : undefined
            }
          />

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              <span>
                Eu concordo com os <a href="#">Termos de uso</a> e a{" "}
                <a href="#">Política de privacidade</a>
              </span>
            </label>
          </div>

          <Button
            variant="primary"
            className="button--full-width"
            type="submit"
            disabled={authLoading}
          >
            {authLoading ? "Carregando..." : "Criar conta"}
          </Button>
          {authError && <p className="error-message">{authError}</p>}
        </form>

        <div className="auth-toggle">
          <span>Já tem uma conta?</span>
          <Link to={paths.login} className="toggle-button">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
