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
    bgcolor: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: 4,
    backdropFilter: "blur(10px)",
    transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
    height: "100%",
    "&:hover": {
      boxShadow: 6,
      bgcolor: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(59, 130, 246, 0.3)",
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
    gap: 2,
    minHeight: { xs: 72, sm: 80 },
    padding: { xs: 2, sm: 2.5 },
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
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    wordBreak: "break-word",
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
