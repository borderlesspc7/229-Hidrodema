import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import { sanitizeForDatabase } from "../lib/validation";
import type {
  Budget,
  DiaryEntry,
  InventoryItem,
  ObraReport,
  QualityChecklist,
  Supplier,
} from "../types/obrasGerenciamentoModule";

const C_DIARIES = "obrasDiaries";
const C_INVENTORY = "obrasInventory";
const C_BUDGETS = "obrasBudgets";
const C_SUPPLIERS = "obrasSuppliers";
const C_QUALITY = "obrasQualityChecklists";
const C_REPORTS = "obrasReports";

const LS_KEYS = {
  diaries: "obrasDiaries",
  inventory: "obrasInventory",
  budgets: "obrasBudgets",
  suppliers: "obrasSuppliers",
  quality: "obrasQualityChecklists",
  reports: "obrasReports",
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
  budgets: Budget[];
  suppliers: Supplier[];
  qualityChecklists: QualityChecklist[];
  reports: ObraReport[];
}> {
  const [dSnap, iSnap, bSnap, sSnap, qSnap, rSnap] = await Promise.all([
    getDocs(collection(db, C_DIARIES)),
    getDocs(collection(db, C_INVENTORY)),
    getDocs(collection(db, C_BUDGETS)),
    getDocs(collection(db, C_SUPPLIERS)),
    getDocs(collection(db, C_QUALITY)),
    getDocs(collection(db, C_REPORTS)),
  ]);

  const diaries = sortDiaries(
    dSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as DiaryEntry)
  );
  const inventory = iSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as InventoryItem
  );
  const budgets = bSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Budget);
  const suppliers = sSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Supplier
  );
  const qualityChecklists = qSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as QualityChecklist
  );
  const reports = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as ObraReport);

  return {
    diaries,
    inventory,
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
