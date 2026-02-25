import { Link } from "react-router-dom";
import {
  Card,
  CardActionArea,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
interface ServiceTileProps {
  label: string;
  to: string;
  Icon: React.ComponentType<{ sx?: SxProps<Theme> }>;
  external?: boolean;
}

export default function ServiceTile({
  label,
  to,
  Icon,
  external = false,
}: ServiceTileProps) {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const cardSx: SxProps<Theme> = {
    bgcolor: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: 2, /* 16px — bordas arredondadas modernas */
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow:
      "0 4px 24px rgba(0, 0, 0, 0.12), 0 0 1px rgba(255, 255, 255, 0.08)",
    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    height: "100%",
    minHeight: 160,
    "&:hover": {
      bgcolor: "rgba(255, 255, 255, 0.11)",
      borderColor: "rgba(255, 255, 255, 0.18)",
      boxShadow:
        "0 12px 32px rgba(0, 0, 0, 0.18), 0 0 24px rgba(59, 130, 246, 0.12)",
      transform: prefersReducedMotion ? "none" : "translateY(-4px)",
    },
    "&:active": {
      transform: prefersReducedMotion ? "none" : "scale(0.98)",
    },
    "& .MuiCardActionArea-focusVisible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  };

  const contentSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 2.5, /* 20px — melhor espaçamento entre ícone e texto */
    minHeight: 160,
    padding: { xs: 3, sm: 3.5 }, /* 24px / 28px — mesmo padding interno */
  };

  const iconSx: SxProps<Theme> = {
    fontSize: { xs: 40, sm: 48 }, /* ícones maiores e destacados */
    color: "#fff",
    filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))",
  };

  const textSx: SxProps<Theme> = {
    color: "#fff",
    fontSize: { xs: "0.9375rem", sm: "1.0625rem" },
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    lineHeight: 1.25,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    wordBreak: "break-word",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
  };

  const content = (
    <CardActionArea
      sx={{
        height: "100%",
        "&:focus-visible": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box sx={contentSx}>
        <Icon sx={iconSx} />
        <Box component="span" sx={textSx}>
          {label}
        </Box>
      </Box>
    </CardActionArea>
  );

  if (external) {
    return (
      <Card
        component="a"
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        sx={cardSx}
        role="link"
        aria-label={label}
      >
        {content}
      </Card>
    );
  }

  return (
    <Card
      component={Link}
      to={to}
      sx={cardSx}
      role="link"
      aria-label={label}
    >
      {content}
    </Card>
  );
}
