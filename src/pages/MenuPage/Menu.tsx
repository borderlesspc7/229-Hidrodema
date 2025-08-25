import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import "./Menu.css";

export default function Menu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(paths.login);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (!user) {
    navigate(paths.login);
    return null;
  }

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">Bem-vindo, {user.name}!</h1>
        <p className="menu-subtitle">Escolha uma opção para continuar</p>
      </div>

      <div className="menu-grid">
        <div className="menu-item" onClick={() => console.log("Dashboard")}>
          <div className="menu-icon">📊</div>
          <h3>Dashboard</h3>
          <p>Visualize estatísticas e relatórios</p>
        </div>

        <div className="menu-item" onClick={() => console.log("Projetos")}>
          <div className="menu-icon">🏗️</div>
          <h3>Projetos</h3>
          <p>Gerencie seus projetos ativos</p>
        </div>

        <div className="menu-item" onClick={() => console.log("Clientes")}>
          <div className="menu-icon">👥</div>
          <h3>Clientes</h3>
          <p>Cadastro e gestão de clientes</p>
        </div>

        <div className="menu-item" onClick={() => console.log("Relatórios")}>
          <div className="menu-icon">📋</div>
          <h3>Relatórios</h3>
          <p>Gere relatórios personalizados</p>
        </div>

        <div className="menu-item" onClick={() => console.log("Configurações")}>
          <div className="menu-icon">⚙️</div>
          <h3>Configurações</h3>
          <p>Configure sua conta e preferências</p>
        </div>

        <div className="menu-item" onClick={() => console.log("Suporte")}>
          <div className="menu-icon">🆘</div>
          <h3>Suporte</h3>
          <p>Entre em contato com o suporte</p>
        </div>
      </div>

      <div className="menu-footer">
        <button className="logout-button" onClick={handleLogout}>
          Sair da conta
        </button>
      </div>
    </div>
  );
}
