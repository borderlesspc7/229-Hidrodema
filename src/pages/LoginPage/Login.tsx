import React, { useState, useEffect } from "react";
import "./Login.css";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { paths } from "../../routes/paths";

export default function Login() {
  const { login, loading: authLoading, error: authError, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redireciona para o menu se já estiver logado
  useEffect(() => {
    if (user) {
      navigate(paths.menu);
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

  return (
    <div className="login-page">
      {/* Título da Empresa */}
      <div className="company-brand">
        <img
          src="/src/img/HIDRODEMA_LogoNovo_Branco (2).png"
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
            <a href="#" className="forgot-password">
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
    </div>
  );
}
