import "./HidroService.css";
import { useNavigate } from "react-router-dom";
import { paths } from "../../routes/paths";
import { Button, Container, Box, ThemeProvider, createTheme } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import {
  Science,
  Straighten,
  Opacity,
  Scale,
  School,
} from "@mui/icons-material";
import ServiceTile from "../../components/ServiceTile/ServiceTile";

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
    to: "https://www.senai.br/cursos/hidroservice",
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
        <Container maxWidth="lg" sx={{ width: "100%", py: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 4,
              width: "100%",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              aria-label="Voltar para o menu"
              sx={{
                color: "#fff",
                borderColor: "rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Voltar
            </Button>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div className="hidro-service-company-brand">
                <img
                  src="/Logo HidroService.png"
                  alt="HIDRO SERVICE"
                  className="hidro-service-logo"
                />
                <div className="hidro-service-company-underline"></div>
              </div>
            </Box>
            <Box sx={{ width: 100 }} /> {/* Spacer */}
          </Box>

          {/* Grid de Serviços */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                xl: "repeat(3, 1fr)",
              },
              gap: 3,
              mb: 4,
            }}
          >
            {services.map((service) => (
              <ServiceTile
                key={service.label}
                label={service.label}
                to={service.to}
                Icon={service.Icon}
                external={service.external}
              />
            ))}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mt: 4,
            }}
          >
            <img
              src="/HIDRODEMA_LogoNovo_Branco (2).png"
              alt="HIDRODEMA"
              className="hidro-service-footer-logo"
            />
            <Button
              variant="outlined"
              onClick={() => navigate(paths.acessoExclusivo)}
              sx={{
                color: "#fff",
                borderColor: "rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Acesso Exclusivo
            </Button>
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}
