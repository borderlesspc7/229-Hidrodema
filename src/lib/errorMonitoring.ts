/**
 * Monitorização opcional de erros (Sentry). Só inicializa se `VITE_SENTRY_DSN` estiver definido.
 */
export function initErrorMonitoring(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn?.trim()) return;

  void import("@sentry/react")
    .then((Sentry) => {
      Sentry.init({
        dsn: dsn.trim(),
        environment: import.meta.env.MODE,
        tracesSampleRate: import.meta.env.PROD ? 0.15 : 1,
      });
    })
    .catch(() => {
      // Pacote opcional ou rede indisponível no carregamento dinâmico
    });
}
