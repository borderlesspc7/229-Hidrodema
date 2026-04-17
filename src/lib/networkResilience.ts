/** Fetch com timeout para cenários de rede instável (testes e integração Seller). */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 25_000, ...rest } = init;
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...rest, signal: ctrl.signal });
  } finally {
    window.clearTimeout(t);
  }
}
