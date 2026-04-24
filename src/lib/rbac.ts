import type { User, UserRole } from "../types/user";
import type { VisitRequest, VisitReport } from "../services/visitasService";

export function normalizeRole(role: User["role"]): UserRole {
  if (role === "admin" || role === "gestor" || role === "vendedor") return role;
  return "user";
}

/** Visão macro: gestão, relatórios consolidados e obras sem dono explícito. */
export function hasMacroVisibility(user: User | null): boolean {
  if (!user) return false;
  const r = normalizeRole(user.role);
  return r === "admin" || r === "gestor";
}

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return normalizeRole(user.role) === "admin";
}

export function isVendedorProfile(user: User | null): boolean {
  if (!user) return false;
  const r = normalizeRole(user.role);
  return r === "vendedor" || r === "user";
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Vendedor "possui" a linha se criou o registro, se o responsável bate com o perfil
 * ou se o código/ID externo aparece no campo agregado de vendedor.
 */
export function userOwnsVisitRow(user: User, row: VisitRequest): boolean {
  if (row.createdBy && row.createdBy === user.uid) return true;

  const sp = row.responsibleSalesperson?.trim();
  if (sp) {
    const n = norm(sp);
    if (user.email && n.includes(norm(user.email))) return true;
    if (user.name && n.includes(norm(user.name))) return true;
    const local = user.email?.split("@")[0];
    if (local && n.includes(norm(local))) return true;
  }

  const vend = row.vendedor?.trim() ?? "";
  if (vend) {
    if (user.sellerCode?.trim() && vend.includes(user.sellerCode.trim())) return true;
    if (user.sellerExternalId?.trim() && vend.includes(user.sellerExternalId.trim()))
      return true;
    if (user.name && vend.includes(user.name.trim())) return true;
  }

  return false;
}

export function filterVisitRequestsForUser(
  user: User | null,
  rows: VisitRequest[]
): VisitRequest[] {
  if (!user) return [];
  if (hasMacroVisibility(user)) return rows;
  return rows.filter((r) => userOwnsVisitRow(user, r));
}

export function filterVisitReportsForUser(
  user: User | null,
  reports: VisitReport[],
  requestsByRequestId: Map<string, VisitRequest>
): VisitReport[] {
  if (!user) return [];
  if (hasMacroVisibility(user)) return reports;

  return reports.filter((rep) => {
    if (rep.createdBy && rep.createdBy === user.uid) return true;
    const req = rep.requestId ? requestsByRequestId.get(rep.requestId) : undefined;
    if (req) return userOwnsVisitRow(user, req);
    return false;
  });
}

export function canEditVisitRequest(user: User | null, row: VisitRequest): boolean {
  if (!user?.email) return false;
  if (hasMacroVisibility(user)) return true;
  return userOwnsVisitRow(user, row);
}

export function canDeleteVisitRequest(user: User | null, row: VisitRequest): boolean {
  return canEditVisitRequest(user, row);
}

export function canMutateVisitReport(
  user: User | null,
  report: VisitReport,
  parentRequest: VisitRequest | undefined
): boolean {
  if (!user?.email) return false;
  if (hasMacroVisibility(user)) return true;
  if (report.createdBy && report.createdBy === user.uid) return true;
  if (parentRequest) return userOwnsVisitRow(user, parentRequest);
  return false;
}
