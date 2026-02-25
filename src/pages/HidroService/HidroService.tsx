import "./HidroService.css";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import {
  Button,
  Container,
  Box,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import {
  Science,
  Straighten,
  Opacity,
  Scale,
  School,
} from "@mui/icons-material";
import ServiceTile from "../../components/ServiceTile/ServiceTile";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";

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
    fontFamily:
      '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
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
    to: "https://www-hidrodema-com-br.rds.land/treinamentoindustrialsenai",
    Icon: School,
    external: true,
  },
];

export default function HidroService() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(paths.menu);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="hidro-service-container">
        <Container maxWidth="lg" className="hidro-service-inner">
          {/* Breadcrumb */}
          <Breadcrumb />

          {/* Header */}
          <Box className="hidro-service-header-wrapper">
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              aria-label="Voltar para o menu"
              className="hidro-service-back-btn"
            >
              Voltar
            </Button>
            <div className="hidro-service-company-brand">
              <img
                src="/Logo HidroService.png"
                alt="HIDRO SERVICE"
                className="hidro-service-logo"
              />
              <div className="hidro-service-company-underline" />
            </div>
            <Box sx={{ width: { xs: 80, sm: 100 } }} aria-hidden />
          </Box>

          {/* Grid de Serviços — centralizado e formatado */}
          <section className="hidro-service-section" aria-label="Serviços disponíveis">
            <div className="hidro-service-grid">
              {services.map((service) => (
                <div key={service.label} className="hidro-service-tile-wrapper">
                  <ServiceTile
                    label={service.label}
                    to={service.to}
                    Icon={service.Icon}
                    external={service.external}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Footer — Acesso Exclusivo em destaque, HIDRODEMA embaixo */}
          <footer className="hidro-service-footer">
            <Button
              variant="outlined"
              onClick={() => navigate(paths.acessoExclusivo)}
              className="hidro-service-acesso-btn"
            >
              Acesso Exclusivo
            </Button>
            <img
              src="/HIDRODEMA_LogoNovo_Branco (2).png"
              alt="HIDRODEMA"
              className="hidro-service-footer-logo"
            />
          </footer>
        </Container>
      </div>
    </ThemeProvider>
  );
}
