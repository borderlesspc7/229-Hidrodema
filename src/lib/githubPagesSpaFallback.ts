export function applyGithubPagesSpaFallback(): void {
  // GitHub Pages SPA fallback: reidrata rota vinda do 404.html (?p=...)
  const params = new URLSearchParams(window.location.search);
  const p = params.get("p");
  if (!p) return;

  params.delete("p");
  const next = `${p}${params.toString() ? (p.includes("?") ? "&" : "?") + params.toString() : ""}`;
  window.history.replaceState(null, "", next);
}

