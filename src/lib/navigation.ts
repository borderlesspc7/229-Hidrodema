import type { NavigateFunction } from "react-router-dom";

/**
 * Volta na pilha do histórico quando há entrada anterior na sessão SPA.
 * O React Router marca o primeiro carregamento com `location.key === "default"`;
 * nesse caso usa-se `fallbackPath` (entrada direta, refresh ou bookmark).
 */
export function navigateBackOrFallback(
  navigate: NavigateFunction,
  locationKey: string,
  fallbackPath: string
): void {
  if (locationKey !== "default") {
    navigate(-1);
    return;
  }
  navigate(fallbackPath);
}
