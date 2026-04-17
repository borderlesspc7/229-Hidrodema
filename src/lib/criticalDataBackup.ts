const STORAGE_KEY = "hidrodema_obras_critical_backup_v1";
const MAX_BYTES = 4_000_000;

export type CriticalBackupPayload = {
  savedAt: string;
  diariesJson: string;
  reportsJson: string;
  inventoryJson: string;
  budgetsJson: string;
  suppliersJson: string;
  qualityJson: string;
};

/**
 * Cópia local dos dados críticos do módulo (fallback se a ligação cair).
 * Não substitui o Firebase; serve como rede de segurança no browser.
 */
export function runCriticalDataBackup(snapshot: {
  diaries: unknown;
  reports: unknown;
  inventory: unknown;
  budgets: unknown;
  suppliers: unknown;
  qualityChecklists: unknown;
}): void {
  try {
    const payload: CriticalBackupPayload = {
      savedAt: new Date().toISOString(),
      diariesJson: JSON.stringify(snapshot.diaries),
      reportsJson: JSON.stringify(snapshot.reports),
      inventoryJson: JSON.stringify(snapshot.inventory),
      budgetsJson: JSON.stringify(snapshot.budgets),
      suppliersJson: JSON.stringify(snapshot.suppliers),
      qualityJson: JSON.stringify(snapshot.qualityChecklists),
    };
    const line = JSON.stringify(payload);
    if (line.length > MAX_BYTES) {
      console.warn(
        "Backup local: dados demasiado grandes; ignorado para não exceder quota."
      );
      return;
    }
    localStorage.setItem(STORAGE_KEY, line);
  } catch (e) {
    console.warn("Backup local falhou:", e);
  }
}

export function scheduleCriticalDataBackup(
  getSnapshot: () => Parameters<typeof runCriticalDataBackup>[0],
  intervalMs: number
): () => void {
  const id = window.setInterval(() => {
    runCriticalDataBackup(getSnapshot());
  }, intervalMs);
  return () => window.clearInterval(id);
}
