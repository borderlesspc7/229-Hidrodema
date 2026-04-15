/**
 * Converte createdAt (string ISO ou Timestamp do Firestore) em ms.
 */
function createdAtToMs(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "string") {
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

/**
 * Ordena por `createdAt` decrescente após um `getDocs` **sem** `orderBy` no Firestore,
 * evitando índices compostos obrigatórios em queries `where` + `orderBy`.
 */
export function sortByCreatedAtDesc<T extends { createdAt?: unknown }>(
  rows: T[]
): T[] {
  return [...rows].sort(
    (a, b) => createdAtToMs(b.createdAt) - createdAtToMs(a.createdAt)
  );
}
