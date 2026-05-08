import type { User, UserRole } from "../types/user";

const KEY = "hidrodema.demoUser.v1";

export function isDemoEnabled(): boolean {
  const flag = String(import.meta.env.VITE_DEMO_MODE ?? "").toLowerCase();
  return Boolean(import.meta.env.DEV) || ["1", "true", "yes", "on"].includes(flag);
}

export function getDemoUser(): User | null {
  if (!isDemoEnabled()) return null;
  try {
    // Demo deve ser "temporário" (sessão). Se existir legado no localStorage, limpa.
    const legacy = localStorage.getItem(KEY);
    if (legacy) localStorage.removeItem(KEY);

    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.uid !== "string" || typeof parsed.email !== "string") return null;
    return {
      uid: parsed.uid,
      email: parsed.email,
      name: typeof parsed.name === "string" ? parsed.name : "Demo",
      role: parsed.role as UserRole,
      sellerCode: typeof parsed.sellerCode === "string" ? parsed.sellerCode : undefined,
      sellerExternalId:
        typeof parsed.sellerExternalId === "string" ? parsed.sellerExternalId : undefined,
      regionId: typeof parsed.regionId === "string" ? parsed.regionId : undefined,
      teamId: typeof parsed.teamId === "string" ? parsed.teamId : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch {
    return null;
  }
}

export function setDemoUser(params: { role: UserRole }): User {
  const u: User = {
    uid: `demo-${params.role}`,
    email: `${params.role}@demo.local`,
    name: `Demo (${params.role})`,
    role: params.role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  sessionStorage.setItem(
    KEY,
    JSON.stringify({
      uid: u.uid,
      email: u.email,
      name: u.name,
      role: u.role,
    })
  );
  return u;
}

export function clearDemoUser() {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
}
