import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiChevronRight } from "react-icons/fi";
import "./Breadcrumb.css";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  autoGenerate?: boolean;
}

const pathNames: Record<string, string> = {
  "": "Início",
  menu: "Menu Principal",
  service: "HidroService",
  "resistencia-quimica": "Resistência Química",
  "espacamento-suportes": "Espaçamento de Suportes",
  "consumo-adesivo": "Consumo de Adesivo",
  "peso-termoplasticos": "Peso Termoplásticos",
  "acesso-exclusivo": "Acesso Exclusivo",
  "equalizador-servicos": "Equalizador de Serviços",
  "gerenciamento-obras": "Gerenciamento de Obras",
  "relatorio-visitas": "Relatório de Visitas",
  "solicitacao-servicos": "Solicitação de Serviços",
  login: "Login",
  register: "Cadastro",
};

export default function Breadcrumb({
  items,
  autoGenerate = true,
}: BreadcrumbProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbItems: BreadcrumbItem[] =
    items ||
    (() => {
      if (!autoGenerate) return [];

      const pathSegments = location.pathname.split("/").filter(Boolean);
      const generatedItems: BreadcrumbItem[] = [];

      pathSegments.forEach((segment, index) => {
        const path = "/" + pathSegments.slice(0, index + 1).join("/");
        const label =
          pathNames[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);
        generatedItems.push({ label, path });
      });

      return generatedItems;
    })();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumb-container" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <button
            className="breadcrumb-link breadcrumb-home"
            onClick={() => handleNavigate("/menu")}
            aria-label="Ir para página inicial"
          >
            <FiHome className="breadcrumb-home-icon" />
          </button>
        </li>

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.path} className="breadcrumb-item">
              <FiChevronRight className="breadcrumb-separator" />
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  className="breadcrumb-link"
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
