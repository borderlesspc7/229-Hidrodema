import type { User } from "../types/user";
import type { ObraReport } from "../types/obrasGerenciamentoModule";
import { normalizeRole } from "./rbac";

export function isReportFinalized(report: ObraReport): boolean {
  return Boolean(report.finalizedAt);
}

export function canEditFinalizedReport(user: User | null): boolean {
  const r = user ? normalizeRole(user.role) : "user";
  return r === "admin" || r === "gestor";
}

/** Utilizador pode editar o relatório (rascunhos ou finalizados só para admin). */
export function canEditReport(user: User | null, report: ObraReport): boolean {
  if (!user?.email) return false;
  if (!isReportFinalized(report)) return true;
  return canEditFinalizedReport(user);
}

export function canDeleteFinalizedReport(user: User | null): boolean {
  const r = user ? normalizeRole(user.role) : "user";
  return r === "admin" || r === "gestor";
}
