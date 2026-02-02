import { Component, type ErrorInfo, type ReactNode } from "react";
import { paths } from "../../../routes/paths";
import "./ErrorBoundary.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary global: captura erros não tratados na árvore de componentes
 * e exibe uma tela amigável com opção de recarregar ou voltar ao menu.
 * Deve ser um componente de classe (React só suporta getDerivedStateFromError
 * e componentDidCatch em classes).
 */
class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary capturou um erro:", error, errorInfo);
  }

  handleRecarregar = () => {
    window.location.reload();
  };

  handleVoltarAoMenu = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = paths.menu;
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-content">
            <div className="error-boundary-icon" aria-hidden="true">
              ⚠
            </div>
            <h1 className="error-boundary-title">Algo deu errado</h1>
            <p className="error-boundary-message">
              Ocorreu um erro inesperado. Você pode recarregar a página ou voltar
              ao menu.
            </p>
            <div className="error-boundary-actions">
              <button
                type="button"
                className="error-boundary-btn error-boundary-btn-primary"
                onClick={this.handleRecarregar}
              >
                Recarregar página
              </button>
              <button
                type="button"
                className="error-boundary-btn error-boundary-btn-secondary"
                onClick={this.handleVoltarAoMenu}
              >
                Voltar ao menu
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper para usar useNavigate (opcional: poderia usar window.location no class)
// Mantemos o class puro com window.location para não precisar de wrapper com hook
export default ErrorBoundaryClass;
