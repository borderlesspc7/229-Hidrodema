import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { paths } from "./paths";
import type { UserRole } from "../types/user";
import { normalizeRole } from "../lib/rbac";
import PageLoading from "../components/PageLoading";

export function RoleRoute({
  children,
  allow,
}: {
  children: ReactNode;
  allow: UserRole[];
}) {
  const { user, loading, initializing } = useAuth();

  if (loading || initializing) return <PageLoading />;

  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  const r = normalizeRole(user.role);
  if (!allow.includes(r)) {
    return <Navigate to={paths.acessoExclusivo} replace />;
  }

  return <>{children}</>;
}
