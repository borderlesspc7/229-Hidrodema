import { Link } from "react-router-dom";
import { Box, useTheme, useMediaQuery } from "@mui/material";
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

  const tileSx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 2,
    padding: { xs: 2.5, sm: 3 },
    textDecoration: "none",
    color: "inherit",
    borderRadius: 3,
    transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1), filter 150ms cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: prefersReducedMotion ? "none" : "translateY(-2px)",
      filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.35))",
    },
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 3,
    },
    "&:active": {
      transform: prefersReducedMotion ? "none" : "scale(0.98)",
    },
  };

  const iconSx: SxProps<Theme> = {
    fontSize: { xs: 32, sm: 40 },
    color: "#fff",
  };

  const textSx: SxProps<Theme> = {
    color: "#fff",
    fontSize: { xs: "0.875rem", sm: "1rem" },
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    lineHeight: 1.2,
    textDecoration: "none",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    wordBreak: "break-word",
  };

  const content = (
    <>
      <Icon sx={iconSx} />
      <Box component="span" sx={textSx}>
        {label}
      </Box>
    </>
  );

  if (external) {
    return (
      <Box
        component="a"
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        sx={tileSx}
        role="link"
        aria-label={label}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      component={Link}
      to={to}
      sx={tileSx}
      role="link"
      aria-label={label}
    >
      {content}
    </Box>
  );
}
