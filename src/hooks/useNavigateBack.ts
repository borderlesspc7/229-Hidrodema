import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navigateBackOrFallback } from "../lib/navigation";

/** Botão "Voltar" alinhado ao histórico do browser e com destino seguro. */
export function useNavigateBack(fallbackPath: string) {
  const navigate = useNavigate();
  const { key } = useLocation();

  return useCallback(() => {
    navigateBackOrFallback(navigate, key, fallbackPath);
  }, [navigate, key, fallbackPath]);
}
