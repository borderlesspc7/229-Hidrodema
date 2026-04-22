import { FiArrowLeft } from "react-icons/fi";
import { useNavigateBack } from "../../../hooks/useNavigateBack";
import Button from "../Button/Button";
import "./BackButton.css";

type BackButtonProps = {
  fallbackPath: string;
  label?: string;
  className?: string;
  variant?: "primary" | "secondary";
  title?: string;
};

export default function BackButton({
  fallbackPath,
  label = "Voltar",
  className,
  variant = "secondary",
  title,
}: BackButtonProps) {
  const onBack = useNavigateBack(fallbackPath);
  const classes = ["back-button-ui", className].filter(Boolean).join(" ");

  return (
    <Button variant={variant} className={classes} onClick={onBack} title={title}>
      <span className="back-button-ui__inner">
        <FiArrowLeft className="back-button-ui__icon" aria-hidden="true" />
        <span>{label}</span>
      </span>
    </Button>
  );
}

