export function extractSellerCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw) return null;
  const first = raw.split("-")[0]?.trim() ?? "";
  if (!first) return null;
  // Normalmente é algo como "035184" ou "002620". Mantém somente caracteres úteis.
  const code = first.replace(/[^\w]/g, "");
  return code.length >= 3 ? code : null;
}

