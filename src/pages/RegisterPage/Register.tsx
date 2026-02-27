import { useEffect } from "react";
import AuthLayout from "../../components/auth/AuthLayout/AuthLayout";
import RegisterForm from "../../components/auth/RegisterForm/RegisterForm";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import "../../components/auth/Auth.css";

export default function Register() {
  const { register, loading: authLoading, error: authError, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(paths.menu);
  }, [user, navigate]);

  const handleRegister = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    await register({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "user",
    });
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">
            Preencha os dados para criar sua nova conta
          </p>
        </div>

        <RegisterForm
          onSubmit={handleRegister}
          loading={authLoading}
          error={authError}
        />
      </div>
    </AuthLayout>
  );
}
