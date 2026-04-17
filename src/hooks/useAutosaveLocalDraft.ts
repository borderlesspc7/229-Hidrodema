import { useEffect } from "react";

const DEBOUNCE_MS = 45_000;

/**
 * Guarda rascunho em localStorage após debounce sempre que `deps` mudam.
 */
export function useAutosaveLocalDraft(
  storageKey: string | null | undefined,
  payload: () => Record<string, unknown>,
  deps: unknown[]
): void {
  useEffect(() => {
    if (!storageKey) return;
    const id = window.setTimeout(() => {
      try {
        const data = {
          ...payload(),
          _autosaveAt: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        console.warn("Auto-save (rascunho):", e);
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps controlados pelo chamador
  }, [storageKey, ...deps]);
}

export function tryLoadDraft<T>(storageKey: string): T | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearDraftKey(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}
