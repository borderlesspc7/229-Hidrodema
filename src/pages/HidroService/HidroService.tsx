import "./HidroService.css";
import { Container, Box, ThemeProvider, createTheme } from "@mui/material";
import {
  Science,
  Straighten,
  Opacity,
  Scale,
  School,
} from "@mui/icons-material";
import { FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ServiceTile from "../../components/ServiceTile/ServiceTile";
import Button from "../../components/ui/Button/Button";
import { paths } from "../../routes/paths";

// Tema escuro customizado para MUI
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6",
    },
    background: {
      default: "#0f1419",
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  },
});

const services = [
  {
    label: "Resistência Química",
    to: "/service/resistencia-quimica",
    Icon: Science,
  },
  {
    label: "Espaçamento de Suportes",
    to: "/service/espacamento-suportes",
    Icon: Straighten,
  },
  {
    label: "Consumo de Adesivo",
    to: "/service/consumo-adesivo",
    Icon: Opacity,
  },
  {
    label: "Peso Termoplásticos",
    to: "/service/peso-termoplasticos",
    Icon: Scale,
  },
  {
    label: "Curso SENAI",
    // www.senai.br tem apresentado erro de certificado (NET::ERR_CERT_COMMON_NAME_INVALID).
    // Usar página oficial SENAI-SP (HTTPS válido) como destino externo.
    to: "https://www.sp.senai.br/cursos/",
    Icon: School,
    external: true,
  },
];

export default function HidroService() {
  const navigate = useNavigate();
  const handleGoHome = () => navigate(paths.menu);

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="hidro-service-container hd-page-bg">
        <Container maxWidth="lg" sx={{ width: "100%", py: { xs: 2, sm: 3 } }}>
          <Button
            variant="secondary"
            className="hidro-service-back-button"
            onClick={handleGoHome}
            title="Voltar para a Home"
            aria-label="Voltar para a Home"
          >
            <span className="hidro-service-back-button__inner">
              <FiHome className="hidro-service-back-button__icon" aria-hidden="true" />
              <span>Home</span>
            </span>
          </Button>

          <div className="hidro-service-breadcrumb" aria-label="Breadcrumb">
            <span className="hidro-service-breadcrumb__home" aria-hidden="true">
              ⌂
            </span>
            <span className="hidro-service-breadcrumb__pill">HidroService</span>
          </div>

          {/* Header (como no print): logo central + underline */}
          <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div className="hidro-service-company-brand">
              <img
                src="/Logo HidroService.png"
                alt="HIDRO SERVICE"
                className="hidro-service-logo"
              />
              <div className="hidro-service-company-underline"></div>
            </div>
          </Box>

          {/* Grid de Serviços */}
          <div className="hidro-service-grid">
            {services.map((service, idx) => (
              <div
                key={service.label}
                className={`hidro-service-grid-item hidro-service-grid-item--${idx + 1}`}
              >
                <ServiceTile
                  label={service.label}
                  to={service.to}
                  Icon={service.Icon}
                  external={service.external}
                />
              </div>
            ))}
          </div>
          <Box sx={{ height: { xs: 8, sm: 14 } }} />
        </Container>
      </div>
    </ThemeProvider>
  );
}
