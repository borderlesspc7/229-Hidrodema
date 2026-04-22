function envBool(key: string, defaultValue: boolean): boolean {
  const raw = import.meta.env[key] as string | undefined;
  if (raw === undefined || raw === "") return defaultValue;
  const v = raw.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Módulos opcionais do menu principal. `false` = oculto no menu e URL redireciona para o menu. */
export const features = {
  meeting: envBool("VITE_FEATURE_MEETING", false),
  marketing: envBool("VITE_FEATURE_MARKETING", false),
  /** Tela de sincronização API Seller + diretório (gestor/admin). */
  gestaoVendedores: envBool("VITE_FEATURE_GESTAO_VENDEDORES", true),
} as const;

