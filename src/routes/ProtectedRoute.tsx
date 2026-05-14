import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState, type ReactNode } from "react";
import { paths } from "./paths";
import { SESSION_EXPIRED_MESSAGE, authService } from "../services/authService";
import PageLoading from "../components/PageLoading";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initializing, logout } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);
  const stillLoading = loading || initializing;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (stillLoading) {
        return;
      }
      if (!user) {
        if (!cancelled) {
          setSessionChecked(true);
          setSessionValid(false);
        }
        return;
      }

      const res = await authService.validateSession();
      if (cancelled) return;
      setSessionChecked(true);
      setSessionValid(res.valid);
      if (!res.valid) {
        // ensure local state + firebase state cleared
        await logout();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stillLoading, logout, user?.uid]);

  if (stillLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ sessionExpired: true, message: SESSION_EXPIRED_MESSAGE }}
      />
    );
  }

  if (!sessionChecked) return <PageLoading />;

  if (!sessionValid) {
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ sessionExpired: true, message: SESSION_EXPIRED_MESSAGE }}
      />
    );
  }

  return <>{children}</>;
}
