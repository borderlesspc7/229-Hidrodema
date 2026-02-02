import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { paths } from "../routes/paths";

/**
 * Quando a sessão expira (token inválido, falha de refresh, etc.),
 * redireciona para a página de login para que a mensagem seja exibida.
 */
export default function SessionExpiredHandler() {
  const { sessionExpiredMessage } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionExpiredMessage) {
      navigate(paths.login, { replace: true });
    }
  }, [sessionExpiredMessage, navigate]);

  return null;
}
