import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
} from "firebase/firestore/lite";
import { db } from "../lib/firebaseconfig";
import { sanitizeForDatabase } from "../lib/validation";
import { sortByCreatedAtDesc } from "../lib/firestoreSort";
import {
  REPORT_COUNTER_TYPES,
  buildReportNumber,
} from "../lib/obraReportNumber";
import type {
  Budget,
  DiaryEntry,
  InventoryItem,
  InventoryMovement,
  ObraReport,
  ObraReportType,
  QualityChecklist,
  Supplier,
} from "../types/obrasGerenciamentoModule";

const C_DIARIES = "obrasDiaries";
const C_INVENTORY = "obrasInventory";
const C_BUDGETS = "obrasBudgets";
const C_SUPPLIERS = "obrasSuppliers";
const C_QUALITY = "obrasQualityChecklists";
const C_REPORTS = "obrasReports";
const C_INVENTORY_MOVEMENTS = "obrasInventoryMovements";
const C_COUNTERS = "obrasCounters";

export async function getInventoryItemsByProject(
  projectId: string
): Promise<InventoryItem[]> {
  const q = query(
    collection(db, C_INVENTORY),
    where("projectId", "==", projectId),
    orderBy("lastUpdated", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as InventoryItem);
}

export async function getSuppliersByProject(projectId: string): Promise<Supplier[]> {
  const q = query(
    collection(db, C_SUPPLIERS),
    where("projectId", "==", projectId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Supplier);
}

// Reservado para evolução: equipe/equipamentos por obra (coleções dedicadas)
export async function getTeamMembersByProject(projectId: string): Promise<unknown[]> {
  const q = query(
    collection(db, "obrasTeamMembers"),
    where("projectId", "==", projectId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function getEquipmentByProject(projectId: string): Promise<unknown[]> {
  const q = query(
    collection(db, "obrasEquipment"),
    where("projectId", "==", projectId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

const LS_KEYS = {
  diaries: "obrasDiaries",
  inventory: "obrasInventory",
  budgets: "obrasBudgets",
  suppliers: "obrasSuppliers",
  quality: "obrasQualityChecklists",
  reports: "obrasReports",
  inventoryMovements: "obrasInventoryMovements",
} as const;

const BATCH_MAX = 450;

async function replaceByIdCollection<T extends { id: string }>(
  col: string,
  items: T[]
): Promise<void> {
  const snap = await getDocs(collection(db, col));
  const existing = new Set(snap.docs.map((d) => d.id));
  const incoming = new Set(items.map((i) => i.id));

  type Op =
    | { kind: "delete"; id: string }
    | { kind: "set"; id: string; data: Record<string, unknown> };

  const ops: Op[] = [];
  for (const id of existing) {
    if (!incoming.has(id)) ops.push({ kind: "delete", id });
  }
  for (const item of items) {
    ops.push({
      kind: "set",
      id: item.id,
      data: JSON.parse(
        JSON.stringify(sanitizeForDatabase(item))
      ) as Record<string, unknown>,
    });
  }

  let batch = writeBatch(db);
  let n = 0;
  const flush = async () => {
    if (n === 0) return;
    await batch.commit();
    batch = writeBatch(db);
    n = 0;
  };

  for (const op of ops) {
    if (op.kind === "delete") {
      batch.delete(doc(db, col, op.id));
    } else {
      batch.set(doc(db, col, op.id), op.data);
    }
    n++;
    if (n >= BATCH_MAX) await flush();
  }
  await flush();
}

async function collectionIsEmpty(col: string): Promise<boolean> {
  const snap = await getDocs(collection(db, col));
  return snap.empty;
}

function sortDiaries(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function loadGerenciamentoModuleData(): Promise<{
  diaries: DiaryEntry[];
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  budgets: Budget[];
  suppliers: Supplier[];
  qualityChecklists: QualityChecklist[];
  reports: ObraReport[];
}> {
  const [dSnap, iSnap, mSnap, bSnap, sSnap, qSnap, rSnap] = await Promise.all([
    getDocs(collection(db, C_DIARIES)),
    getDocs(collection(db, C_INVENTORY)),
    getDocs(collection(db, C_INVENTORY_MOVEMENTS)),
    getDocs(collection(db, C_BUDGETS)),
    getDocs(collection(db, C_SUPPLIERS)),
    getDocs(collection(db, C_QUALITY)),
    getDocs(collection(db, C_REPORTS)),
  ]);

  const diaries = sortDiaries(
    dSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as DiaryEntry)
  );
  const inventory = iSnap.docs
    .map(
    (d) => ({ id: d.id, ...d.data() }) as InventoryItem
    )
    .sort(
      (a, b) =>
        new Date(b.lastUpdated || 0).getTime() -
        new Date(a.lastUpdated || 0).getTime()
    );
  const inventoryMovements = sortByCreatedAtDesc(
    mSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as InventoryMovement)
  );
  const budgets = sortByCreatedAtDesc(
    bSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Budget)
  );
  const suppliers = sortByCreatedAtDesc(
    sSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Supplier)
  );
  const qualityChecklists = sortByCreatedAtDesc(
    qSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as QualityChecklist)
  );
  const reports = sortByCreatedAtDesc(
    rSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as ObraReport)
  );

  return {
    diaries,
    inventory,
    inventoryMovements,
    budgets,
    suppliers,
    qualityChecklists,
    reports,
  };
}

/** Se a coleção no Firestore estiver vazia e existir dados no localStorage, envia e remove a chave. */
export async function migrateGerenciamentoModuleFromLocalStorage(): Promise<void> {
  const migrations: Array<{
    col: string;
    lsKey: string;
    replace: (items: { id: string }[]) => Promise<void>;
  }> = [
    {
      col: C_DIARIES,
      lsKey: LS_KEYS.diaries,
      replace: (items) => replaceByIdCollection(C_DIARIES, items as DiaryEntry[]),
    },
    {
      col: C_INVENTORY,
      lsKey: LS_KEYS.inventory,
      replace: (items) =>
        replaceByIdCollection(C_INVENTORY, items as InventoryItem[]),
    },
    {
      col: C_INVENTORY_MOVEMENTS,
      lsKey: LS_KEYS.inventoryMovements,
      replace: (items) =>
        replaceByIdCollection(C_INVENTORY_MOVEMENTS, items as InventoryMovement[]),
    },
    {
      col: C_BUDGETS,
      lsKey: LS_KEYS.budgets,
      replace: (items) => replaceByIdCollection(C_BUDGETS, items as Budget[]),
    },
    {
      col: C_SUPPLIERS,
      lsKey: LS_KEYS.suppliers,
      replace: (items) =>
        replaceByIdCollection(C_SUPPLIERS, items as Supplier[]),
    },
    {
      col: C_QUALITY,
      lsKey: LS_KEYS.quality,
      replace: (items) =>
        replaceByIdCollection(C_QUALITY, items as QualityChecklist[]),
    },
    {
      col: C_REPORTS,
      lsKey: LS_KEYS.reports,
      replace: (items) => replaceByIdCollection(C_REPORTS, items as ObraReport[]),
    },
  ];

  for (const m of migrations) {
    if (!(await collectionIsEmpty(m.col))) continue;
    const raw = localStorage.getItem(m.lsKey);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.removeItem(m.lsKey);
        continue;
      }
      await m.replace(parsed as { id: string }[]);
      localStorage.removeItem(m.lsKey);
    } catch (e) {
      console.error(`Migração falhou (${m.lsKey}):`, e);
    }
  }
}

export async function saveDiariesToCloud(entries: DiaryEntry[]): Promise<void> {
  await replaceByIdCollection(C_DIARIES, entries);
}

export async function saveInventoryToCloud(
  items: InventoryItem[]
): Promise<void> {
  await replaceByIdCollection(C_INVENTORY, items);
}

export async function saveInventoryMovementsToCloud(
  movements: InventoryMovement[]
): Promise<void> {
  await replaceByIdCollection(C_INVENTORY_MOVEMENTS, movements);
}

export async function saveBudgetsToCloud(budgets: Budget[]): Promise<void> {
  await replaceByIdCollection(C_BUDGETS, budgets);
}

export async function saveSuppliersToCloud(
  suppliers: Supplier[]
): Promise<void> {
  await replaceByIdCollection(C_SUPPLIERS, suppliers);
}

export async function saveQualityChecklistsToCloud(
  checklists: QualityChecklist[]
): Promise<void> {
  await replaceByIdCollection(C_QUALITY, checklists);
}

export async function saveReportsToCloud(reports: ObraReport[]): Promise<void> {
  await replaceByIdCollection(C_REPORTS, reports);
}

export async function listReportsFromCloud(): Promise<ObraReport[]> {
  const snap = await getDocs(collection(db, C_REPORTS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ObraReport);
}

export async function createReportInCloud(report: ObraReport): Promise<void> {
  await setDoc(
    doc(db, C_REPORTS, report.id),
    JSON.parse(JSON.stringify(sanitizeForDatabase(report))) as Record<string, unknown>
  );
}

export async function updateReportInCloud(report: ObraReport): Promise<void> {
  await setDoc(
    doc(db, C_REPORTS, report.id),
    JSON.parse(JSON.stringify(sanitizeForDatabase(report))) as Record<string, unknown>,
    { merge: true }
  );
}

export async function deleteReportInCloud(id: string): Promise<void> {
  await deleteDoc(doc(db, C_REPORTS, id));
}

type ReportsCounterDoc = {
  /** Legado: contador único global (migrado para seqByType na primeira reserva). */
  seq?: number;
  /** Contador por tipo — evita “saltos” entre tipos e melhora rastreio. */
  seqByType?: Partial<Record<ObraReportType, number>>;
  updatedAt?: string;
};

/**
 * Reserva um número sequencial por tipo de relatório (documento `obrasCounters/reports`).
 * Usa transação Firestore para evitar duplicidade com vários utilizadores em paralelo.
 * Migra `seq` legado para `seqByType` na primeira utilização.
 */
export async function reserveNextReportNumber(params: {
  type: ObraReportType;
  date: string; // yyyy-mm-dd
}): Promise<string> {
  const { type, date } = params;
  const ref = doc(db, C_COUNTERS, "reports");

  const nextSeq = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const raw = snap.exists() ? (snap.data() as ReportsCounterDoc) : {};
    const legacy = Number.isFinite(Number(raw.seq)) ? Math.max(0, Math.trunc(Number(raw.seq))) : 0;
    const prevByType = { ...(raw.seqByType ?? {}) } as Partial<Record<ObraReportType, number>>;

    for (const t of REPORT_COUNTER_TYPES) {
      if (prevByType[t] == null) {
        prevByType[t] = legacy;
      }
    }

    const cur = Number(prevByType[type]);
    const base = Number.isFinite(cur) ? cur : 0;
    const next = base + 1;
    prevByType[type] = next;

    tx.set(
      ref,
      {
        seqByType: prevByType,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return next;
  });

  return buildReportNumber(type, date, nextSeq);
}
