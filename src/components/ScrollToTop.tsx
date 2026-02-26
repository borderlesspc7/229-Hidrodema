import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Rolagem automática para o topo da página a cada mudança de rota.
 * Garante que novas telas/abas abram sempre no topo, não no meio da página.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
