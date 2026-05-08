import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../../../components/ui/Button/Button";
import {
  listObraProjects,
  listObraProjectsForUser,
  upsertObraProject,
  updateObraProject,
} from "../../../services/obrasProjectsService";
import {
  loadGerenciamentoModuleData,
  migrateGerenciamentoModuleFromLocalStorage,
  createReportInCloud,
  deleteReportInCloud,
  updateReportInCloud,
  reserveNextReportNumber,
  saveBudgetsToCloud,
  saveDiariesToCloud,
  saveInventoryToCloud,
  saveInventoryMovementsToCloud,
  saveQualityChecklistsToCloud,
  saveSuppliersToCloud,
} from "../../../services/obrasGerenciamentoModuleService";
import { paths } from "../../../routes/paths";
import { navigateBackOrFallback } from "../../../lib/navigation";
import { compressImageFile } from "../../../lib/imageCompress";
import {
  finalizeDiaryPhotosForFirestore,
  deleteDiaryPhotoAtPath,
} from "../../../services/obrasDiaryPhotosService";
import { generateObraConsolidatedPdf } from "../../../lib/obrasConsolidatedPrint";
import {
  canDeleteFinalizedReport,
  canEditReport,
  isReportFinalized,
} from "../../../lib/reportPermissions";
import { scheduleCriticalDataBackup } from "../../../lib/criticalDataBackup";
import type {
  Budget,
  DiaryEntry,
  HydrostaticTestReport,
  InventoryItem,
  InventoryMovement,
  Material,
  ObraReport,
  ExpenseReport,
  ProjectCompletionReport,
  RDOReport,
  Photo,
  Project,
  QualityChecklist,
  Supplier,
} from "../../../types/obrasGerenciamentoModule";
import { FiArrowLeft } from "react-icons/fi";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import "./GerenciamentoObras.css";
import type { GerenciamentoObrasViewMode } from "./gerenciamentoObras.types";
import {
  sanitizeForDatabase,
  validateDiaryEntryInput,
  validateInventoryItemInput,
  validateObraReportInput,
  validateProjectInput,
} from "../../../lib/validation";
import GerenciamentoObrasMenu from "./components/menu";
import DiarioObrasForm from "./components/DiarioObrasForm";
import DiarioObrasHistory from "./components/DiarioObrasHistory";
import ProjectManagement from "./components/ProjectManagement";
import InventoryList from "./components/InventoryList";
import InventoryForm from "./components/InventoryForm";
import InventoryEntryForm from "./components/InventoryEntryForm";
import InventoryMovementsList from "./components/InventoryMovementsList";
import ObrasBudgetsPanel from "./components/ObrasBudgetsPanel";
import ObrasSuppliersPanel from "./components/ObrasSuppliersPanel";
import ObrasQualityPanel from "./components/ObrasQualityPanel";
import ObrasNewBudgetForm from "./components/ObrasNewBudgetForm";
import ObrasNewSupplierForm from "./components/ObrasNewSupplierForm";
import ObrasNewQualityForm from "./components/ObrasNewQualityForm";
import ObrasReportsPanel from "./components/ObrasReportsPanel";
import ReportsTypeSelector from "./components/ReportsTypeSelector";
import RDOForm from "./components/RDOForm";
import ExpenseForm from "./components/ExpenseForm";
import HydrostaticTestForm from "./components/HydrostaticTestForm";
import ProjectCompletionForm from "./components/ProjectCompletionForm";
import UnifiedReportsList from "./components/UnifiedReportsList";
import ReportViewer from "./components/ReportViewer";
import ProjectOverview from "./components/ProjectOverview";
import ProjectFilter from "./components/ProjectFilter";

export default function GerenciamentoObras() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] =
    useState<GerenciamentoObrasViewMode>("menu");
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  // New state for expanded functionality
  const [projects, setProjects] = useState<Project[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [qualityChecklists, setQualityChecklists] = useState<
    QualityChecklist[]
  >([]);
  const [reports, setReports] = useState<ObraReport[]>([]);
  const [editingReport, setEditingReport] = useState<ObraReport | null>(null);
  const [viewingReport, setViewingReport] = useState<ObraReport | null>(null);
  const [overviewProjectId, setOverviewProjectId] = useState<string>("");
  const [viewerBackMode, setViewerBackMode] = useState<GerenciamentoObrasViewMode>("reports-unified");

  // Form states for new items
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    client: "",
    budget: 0,
    team: [] as string[],
    labor: "",
  });

  const [newInventoryItem, setNewInventoryItem] = useState({
    projectId: "",
    name: "",
    category: "",
    quantity: 0,
    unit: "un",
    minStock: 0,
    maxStock: 0,
    price: 0,
    supplier: "",
    location: "",
  });

  const [newBudget, setNewBudget] = useState({
    name: "",
    description: "",
    totalAmount: 0,
    projectId: "",
  });

  const [newSupplier, setNewSupplier] = useState({
    projectId: "",
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    rating: 5,
    reliability: "excelente" as "excelente" | "bom" | "regular" | "ruim",
    deliveryTime: 0,
    paymentTerms: "",
    notes: "",
  });

  const [newQualityChecklist, setNewQualityChecklist] = useState({
    name: "",
    description: "",
    projectId: "",
    items: [] as { description: string; responsible: string }[],
  });

  // Form data
  const [obraName, setObraName] = useState("");
  const [date, setDate] = useState("");
  const [activities, setActivities] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [observations, setObservations] = useState("");
  const [weather, setWeather] = useState("");
  const [responsible, setResponsible] = useState("");
  const [status, setStatus] = useState<DiaryEntry["status"]>("em-andamento");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectFilterId, setProjectFilterId] = useState<string>("");

  // Material form
  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materialUnit, setMaterialUnit] = useState("un");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await migrateGerenciamentoModuleFromLocalStorage();
        const data = await loadGerenciamentoModuleData();
        if (cancelled) return;
        setDiaryEntries(data.diaries);
        setInventory(data.inventory);
        setInventoryMovements(data.inventoryMovements ?? []);
        setBudgets(data.budgets);
        setSuppliers(data.suppliers);
        setQualityChecklists(data.qualityChecklists);
        setReports(data.reports ?? []);
      } catch (e) {
        console.error(e);
        alert(
          "Não foi possível carregar diário/estoque/orçamentos no Firebase. Verifique permissões e conexão."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void (async () => {
      if (!user) return;
      try {
        const list = await listObraProjectsForUser(user);
        if (list.length > 0) {
          setProjects(list as unknown as Project[]);
          return;
        }

        // Migração: se ainda existir obras no localStorage, envia para o Firebase
        const savedProjects = localStorage.getItem("obrasProjects");
        if (savedProjects) {
          const parsed = JSON.parse(savedProjects) as Project[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            await Promise.all(
              parsed.map((p) =>
                upsertObraProject({
                  ...p,
                  id: p.id,
                  ownerUid: p.ownerUid ?? user.uid,
                  createdAt: p.createdAt,
                  updatedAt: p.updatedAt,
                } as unknown as Parameters<typeof upsertObraProject>[0])
              )
            );
            localStorage.removeItem("obrasProjects");
            const migrated = await listObraProjectsForUser(user);
            setProjects(migrated as unknown as Project[]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!selectedProjectId) return;
    const exists = projects.some((project) => project.id === selectedProjectId);
    if (!exists) {
      setSelectedProjectId("");
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!projectFilterId) return;
    // Keep diary/report "selectedProjectId" in sync when filter is active
    setSelectedProjectId((prev) => prev || projectFilterId);
    setNewInventoryItem((prev) => ({ ...prev, projectId: prev.projectId || projectFilterId }));
    setNewBudget((prev) => ({ ...prev, projectId: prev.projectId || projectFilterId }));
    setNewQualityChecklist((prev) => ({ ...prev, projectId: prev.projectId || projectFilterId }));
    setNewSupplier((prev) => ({ ...prev, projectId: prev.projectId || projectFilterId }));
  }, [projectFilterId]);

  const criticalBackupRef = useRef({
    diaryEntries: [] as DiaryEntry[],
    reports: [] as ObraReport[],
    inventory: [] as InventoryItem[],
    budgets: [] as Budget[],
    suppliers: [] as Supplier[],
    qualityChecklists: [] as QualityChecklist[],
  });
  criticalBackupRef.current = {
    diaryEntries,
    reports,
    inventory,
    budgets,
    suppliers,
    qualityChecklists,
  };

  useEffect(() => {
    return scheduleCriticalDataBackup(
      () => ({
        diaries: criticalBackupRef.current.diaryEntries,
        reports: criticalBackupRef.current.reports,
        inventory: criticalBackupRef.current.inventory,
        budgets: criticalBackupRef.current.budgets,
        suppliers: criticalBackupRef.current.suppliers,
        qualityChecklists: criticalBackupRef.current.qualityChecklists,
      }),
      12 * 60 * 1000
    );
  }, []);

  const scopedDiaryEntries = useMemo(() => {
    if (!projectFilterId) return diaryEntries;
    return diaryEntries.filter((d) => d.projectId === projectFilterId);
  }, [diaryEntries, projectFilterId]);

  const scopedInventory = useMemo(() => {
    if (!projectFilterId) return inventory;
    return inventory.filter((i) => i.projectId === projectFilterId);
  }, [inventory, projectFilterId]);

  const scopedBudgets = useMemo(() => {
    if (!projectFilterId) return budgets;
    return budgets.filter((b) => b.projectId === projectFilterId);
  }, [budgets, projectFilterId]);

  const scopedSuppliers = useMemo(() => {
    if (!projectFilterId) return suppliers;
    return suppliers.filter((s) => s.projectId === projectFilterId);
  }, [suppliers, projectFilterId]);

  const scopedQualityChecklists = useMemo(() => {
    if (!projectFilterId) return qualityChecklists;
    return qualityChecklists.filter((q) => q.projectId === projectFilterId);
  }, [projectFilterId, qualityChecklists]);

  const scopedReports = useMemo(() => {
    if (!projectFilterId) return reports;
    return reports.filter((r) => r.projectId === projectFilterId);
  }, [projectFilterId, reports]);

  const saveDiaries = async (entries: DiaryEntry[]) => {
    try {
      await saveDiariesToCloud(entries);
      setDiaryEntries(entries);
    } catch (e) {
      console.error(e);
      alert(
        "Não foi possível salvar o diário no Firebase. Registros com muitas fotos podem exceder o limite (~1 MB por documento)."
      );
    }
  };

  const saveInventory = async (items: InventoryItem[]) => {
    try {
      await saveInventoryToCloud(items);
      setInventory(items);
    } catch (e) {
      console.error(e);
      alert("Não foi possível salvar o estoque no Firebase.");
    }
  };

  const saveInventoryMovements = async (items: InventoryMovement[]) => {
    try {
      await saveInventoryMovementsToCloud(items);
      setInventoryMovements(items);
    } catch (e) {
      console.error(e);
      alert("Não foi possível salvar o histórico de estoque no Firebase.");
    }
  };

  const saveBudgets = async (next: Budget[]) => {
    try {
      await saveBudgetsToCloud(next);
      setBudgets(next);
    } catch (e) {
      console.error(e);
      alert("Não foi possível salvar os orçamentos no Firebase.");
    }
  };

  const saveSuppliers = async (next: Supplier[]) => {
    try {
      await saveSuppliersToCloud(next);
      setSuppliers(next);
    } catch (e) {
      console.error(e);
      alert("Não foi possível salvar os fornecedores no Firebase.");
    }
  };

  const saveQualityChecklists = async (next: QualityChecklist[]) => {
    try {
      await saveQualityChecklistsToCloud(next);
      setQualityChecklists(next);
    } catch (e) {
      console.error(e);
      alert("Não foi possível salvar os checklists no Firebase.");
    }
  };

  const deleteReport = async (id: string) => {
    const r = reports.find((x) => x.id === id);
    if (r && isReportFinalized(r) && !canDeleteFinalizedReport(user)) {
      alert(
        "Relatórios finalizados só podem ser excluídos por um administrador."
      );
      return;
    }
    try {
      await deleteReportInCloud(id);
      setReports((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      alert("Não foi possível excluir o relatório no Firebase.");
    }
  };

  const startEditingReport = (report: ObraReport) => {
    if (user && !canEditReport(user, report)) {
      alert(
        "Este relatório está finalizado. Apenas administradores podem editá-lo."
      );
      return;
    }
    setEditingReport(report);
    if (report.type === "rdo") setViewMode("reports-rdo-edit");
    else if (report.type === "expense") setViewMode("reports-expense-edit");
    else if (report.type === "hydrostatic-test") setViewMode("reports-hydrostatic-edit");
    else setViewMode("reports-completion-edit");
  };

  const openReportViewer = (report: ObraReport) => {
    setViewingReport(report);
    setViewerBackMode("reports-unified");
    setViewMode("report-viewer");
  };

  const openReportViewerFromReportsPanel = (report: ObraReport) => {
    setViewingReport(report);
    setViewerBackMode("reports");
    setViewMode("report-viewer");
  };

  const openReportViewerFromOverview = (report: ObraReport) => {
    setViewingReport(report);
    setViewerBackMode("project-overview");
    setViewMode("report-viewer");
  };

  const openProjectOverview = (projectId: string) => {
    setOverviewProjectId(projectId);
    setViewMode("project-overview");
  };

  const updateReport = async (
    id: string,
    updates: Partial<Omit<ObraReport, "id" | "createdAt">>
  ) => {
    try {
      const nextUpdatedAt = new Date().toISOString();
      const current = reports.find((r) => r.id === id);
      if (!current) return;
      if (isReportFinalized(current) && user && !canEditReport(user, current)) {
        alert(
          "Este relatório está finalizado. Apenas administradores podem alterá-lo."
        );
        return;
      }
      const merged = { ...current, ...updates, updatedAt: nextUpdatedAt } as ObraReport;
      await updateReportInCloud(merged);
      setReports((prev) => prev.map((r) => (r.id === id ? merged : r)));
    } catch (e) {
      console.error(e);
      alert("Não foi possível atualizar o relatório no Firebase.");
    }
  };

  const finalizeReport = async (id: string) => {
    const current = reports.find((r) => r.id === id);
    if (!current || isReportFinalized(current)) return;
    if (
      !confirm(
        "Finalizar este relatório? Depois disso, só administradores poderão editá-lo."
      )
    ) {
      return;
    }
    const finalizedAt = new Date().toISOString();
    const finalizedByEmail = user?.email ?? undefined;
    await updateReport(id, { finalizedAt, finalizedByEmail });
    setViewingReport((prev) =>
      prev && prev.id === id
        ? ({ ...prev, finalizedAt, finalizedByEmail } as ObraReport)
        : prev
    );
  };

  const unlockReportForAdmin = async (id: string) => {
    if (user?.role !== "admin") return;
    const current = reports.find((r) => r.id === id);
    if (!current || !isReportFinalized(current)) return;
    if (!confirm("Reabrir este relatório para edição?")) return;
    try {
      const raw = { ...(current as unknown as Record<string, unknown>) };
      delete raw.finalizedAt;
      delete raw.finalizedByEmail;
      raw.updatedAt = new Date().toISOString();
      const merged = raw as unknown as ObraReport;
      await updateReportInCloud(merged);
      setReports((prev) => prev.map((r) => (r.id === id ? merged : r)));
      setViewingReport((v) => (v && v.id === id ? merged : v));
    } catch (e) {
      console.error(e);
      alert("Não foi possível reabrir o relatório.");
    }
  };

  const draftKey = useCallback(
    (kind: string) =>
      user?.uid ? `hidrodema-draft-${kind}-${user.uid}` : undefined,
    [user?.uid]
  );

  const createRdoReport = async (report: RDOReport) => {
    const reportNumber =
      report.reportNumber ?? (await reserveNextReportNumber({ type: report.type, date: report.date }));
    const next = { ...report, reportNumber } as RDOReport;
    await createReportInCloud(next);
    setReports((prev) => [...prev, next]);
    return next;
  };

  const createExpenseReport = async (report: ExpenseReport) => {
    const reportNumber =
      report.reportNumber ?? (await reserveNextReportNumber({ type: report.type, date: report.date }));
    const next = { ...report, reportNumber } as ExpenseReport;
    await createReportInCloud(next);
    setReports((prev) => [...prev, next]);
    return next;
  };

  const createHydrostaticTestReport = async (report: HydrostaticTestReport) => {
    const reportNumber =
      report.reportNumber ?? (await reserveNextReportNumber({ type: report.type, date: report.date }));
    const next = { ...report, reportNumber } as HydrostaticTestReport;
    await createReportInCloud(next);
    setReports((prev) => [...prev, next]);
    return next;
  };

  const createProjectCompletionReport = async (report: ProjectCompletionReport) => {
    const reportNumber =
      report.reportNumber ?? (await reserveNextReportNumber({ type: report.type, date: report.date }));
    const next = { ...report, reportNumber } as ProjectCompletionReport;
    await createReportInCloud(next);
    setReports((prev) => [...prev, next]);
    return next;
  };

  const resetForm = () => {
    setObraName("");
    setDate("");
    setActivities("");
    setMaterials([]);
    setPhotos([]);
    setObservations("");
    setWeather("");
    setResponsible("");
    setStatus("em-andamento");
    setEditingEntry(null);
    setSelectedProjectId("");
  };

  const resetNewProjectForm = () => {
    setNewProject({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      client: "",
      budget: 0,
      team: [],
      labor: "",
    });
  };

  const resetNewInventoryForm = () => {
    setNewInventoryItem({
      projectId: "",
      name: "",
      category: "",
      quantity: 0,
      unit: "un",
      minStock: 0,
      maxStock: 0,
      price: 0,
      supplier: "",
      location: "",
    });
  };

  const resetNewBudgetForm = () => {
    setNewBudget({
      name: "",
      description: "",
      totalAmount: 0,
      projectId: "",
    });
  };

  const resetNewSupplierForm = () => {
    setNewSupplier({
      projectId: "",
      name: "",
      contact: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      rating: 5,
      reliability: "excelente",
      deliveryTime: 0,
      paymentTerms: "",
      notes: "",
    });
  };

  const resetNewQualityForm = () => {
    setNewQualityChecklist({
      name: "",
      description: "",
      projectId: "",
      items: [],
    });
  };

  const handleAddMaterial = () => {
    if (!materialName || !materialQuantity) {
      alert("Preencha o nome e quantidade do material");
      return;
    }

    const newMaterial: Material = {
      id: Date.now().toString(),
      name: materialName,
      quantity: materialQuantity,
      unit: materialUnit,
    };

    setMaterials([...materials, newMaterial]);
    setMaterialName("");
    setMaterialQuantity("");
    setMaterialUnit("un");
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const MAX_FILES_PER_UPLOAD = 12;
    const MAX_ORIGINAL_BYTES = 24 * 1024 * 1024;

    const list = Array.from(files).slice(0, MAX_FILES_PER_UPLOAD);
    if (files.length > MAX_FILES_PER_UPLOAD) {
      alert(`Limite de ${MAX_FILES_PER_UPLOAD} fotos por envio. As demais foram ignoradas.`);
    }

    void (async () => {
      for (const file of list) {
        if (!file.type.startsWith("image/")) {
          alert(`Arquivo ignorado (não é imagem): ${file.name}`);
          continue;
        }
        if (file.size > MAX_ORIGINAL_BYTES) {
          alert(`Arquivo muito grande (máx ~24MB antes da compressão): ${file.name}`);
          continue;
        }
        try {
          const { dataUrl } = await compressImageFile(file);
          const id = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
          const photo: Photo = {
            id,
            name: file.name.replace(/\.[^.]+$/i, "") + ".jpg",
            description: "",
            dataUrl,
          };
          setPhotos((prev) => [...prev, photo]);
        } catch (err) {
          console.error(err);
          alert(
            `Não foi possível processar "${file.name}". Use JPG, PNG, WebP ou GIF.`
          );
        }
      }
      e.target.value = "";
    })();
  };

  const handleRemovePhoto = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target?.storagePath) {
      void deleteDiaryPhotoAtPath(target.storagePath);
    }
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const handleUpdatePhotoDescription = (id: string, description: string) => {
    setPhotos(photos.map((p) => (p.id === id ? { ...p, description } : p)));
  };

  const handleSelectProjectForEntry = (projectId: string) => {
    if (!projectId) {
      setSelectedProjectId("");
      return;
    }

    const project = projects.find((p) => p.id === projectId);
    setSelectedProjectId(projectId);

    if (project) {
      setObraName(project.name);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedProjectId) {
      alert("Selecione a obra para vincular este registro.");
      return;
    }
    const draftValidation = validateDiaryEntryInput(
      { projectId: selectedProjectId, obraName, date, activities },
      { allowDraft: true }
    );
    if (draftValidation.ok && draftValidation.warnings?.length) {
      const proceed = confirm(
        `Rascunho com avisos:\n- ${draftValidation.warnings.join("\n- ")}\n\nDeseja salvar mesmo assim?`
      );
      if (!proceed) return;
    } else if (!draftValidation.ok) {
      alert(draftValidation.errors.join("\n"));
      return;
    }

    const entryId = editingEntry?.id || `${Date.now()}`;
    let photoList = photos;
    try {
      photoList = await finalizeDiaryPhotosForFirestore(
        photos,
        entryId,
        selectedProjectId
      );
    } catch (err) {
      console.error(err);
      alert(
        "Erro ao enviar fotos para o armazenamento. Verifique rede e permissões do Firebase Storage."
      );
      return;
    }

    const entry: DiaryEntry = {
      id: entryId,
      projectId: selectedProjectId,
      obraName: draftValidation.value.obraName,
      date: draftValidation.value.date,
      activities: draftValidation.value.activities,
      materials: sanitizeForDatabase(materials),
      photos: sanitizeForDatabase(photoList),
      observations: sanitizeForDatabase(observations),
      weather: sanitizeForDatabase(weather),
      responsible: sanitizeForDatabase(responsible),
      status: sanitizeForDatabase(status),
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingEntry) {
      const updated = diaryEntries.map((e) =>
        e.id === editingEntry.id ? entry : e
      );
      await saveDiaries(updated);
      alert("Registro atualizado com sucesso!");
    } else {
      await saveDiaries([...diaryEntries, entry]);
      alert("Rascunho salvo com sucesso!");
    }

    resetForm();
    setViewMode("history");
  };

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      alert("Selecione a obra para vincular este registro.");
      return;
    }
    const validation = validateDiaryEntryInput({
      projectId: selectedProjectId,
      obraName,
      date,
      activities,
    });
    if (!validation.ok) {
      alert(validation.errors.join("\n"));
      return;
    }

    const entryId = editingEntry?.id || `${Date.now()}`;
    let photoList = photos;
    try {
      photoList = await finalizeDiaryPhotosForFirestore(
        photos,
        entryId,
        selectedProjectId
      );
    } catch (err) {
      console.error(err);
      alert(
        "Erro ao enviar fotos para o armazenamento. Verifique rede e permissões do Firebase Storage."
      );
      return;
    }

    const entry: DiaryEntry = {
      id: entryId,
      projectId: selectedProjectId,
      obraName: validation.value.obraName,
      date: validation.value.date,
      activities: validation.value.activities,
      materials: sanitizeForDatabase(materials),
      photos: sanitizeForDatabase(photoList),
      observations: sanitizeForDatabase(observations),
      weather: sanitizeForDatabase(weather),
      responsible: sanitizeForDatabase(responsible),
      status: sanitizeForDatabase(status),
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingEntry) {
      const updated = diaryEntries.map((e) =>
        e.id === editingEntry.id ? entry : e
      );
      await saveDiaries(updated);
      alert("Registro atualizado com sucesso!");
    } else {
      await saveDiaries([...diaryEntries, entry]);
      alert("Registro salvo com sucesso!");
    }

    resetForm();
    setViewMode("history");
  };

  const handleEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setObraName(entry.obraName);
    setDate(entry.date);
    setActivities(entry.activities);
    setMaterials(entry.materials);
    setPhotos(entry.photos);
    setObservations(entry.observations);
    setWeather(entry.weather);
    setResponsible(entry.responsible);
    setStatus(entry.status);
    const matchingProject =
      projects.find((p) => p.id === entry.projectId) ??
      projects.find((p) => p.name === entry.obraName);
    setSelectedProjectId(matchingProject ? matchingProject.id : "");
    setViewMode("edit");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    const entry = diaryEntries.find((e) => e.id === id);
    if (entry) {
      for (const p of entry.photos ?? []) {
        if (p.storagePath) void deleteDiaryPhotoAtPath(p.storagePath);
      }
    }
    await saveDiaries(diaryEntries.filter((e) => e.id !== id));
  };

  const handleExportPDF = async (entry: DiaryEntry) => {
    const project =
      projects.find((p) => p.id === entry.projectId) ??
      projects.find((p) => p.name === entry.obraName);

    try {
      const { exportObraReportToPdf } = await import("../../../lib/obrasReportPdf");
      await exportObraReportToPdf(
        {
          id: entry.id,
          type: "rdo",
          projectId: entry.projectId,
          date: entry.date,
          activities: entry.activities,
          observations: entry.observations,
          weather: entry.weather,
          responsible: entry.responsible,
          team: [],
          photos: entry.photos ?? [],
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        },
        project
      );
    } catch (e) {
      console.error(e);
      alert("Não foi possível gerar o PDF (verifique rede e fotos na nuvem).");
    }
  };

  const handleBack = () => {
    if (viewMode === "menu") {
      navigateBackOrFallback(navigate, location.key, paths.acessoExclusivo);
    } else {
      resetForm();
      setViewMode("menu");
    }
  };

  // Project Management Functions
  const createProject = (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      ownerUid: user?.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    void (async () => {
      try {
        await upsertObraProject(newProject as unknown as Parameters<typeof upsertObraProject>[0]);
        const list = user ? await listObraProjectsForUser(user) : await listObraProjects();
        setProjects(list as unknown as Project[]);
      } catch (e) {
        console.error(e);
        alert("Não foi possível salvar a obra no Firebase.");
      }
    })();
    return newProject;
  };

  const handleUpdateProjectStatus = async (
    projectId: string,
    status: Project["status"]
  ) => {
    const prev = projects;
    const next = projects.map((p) =>
      p.id === projectId ? { ...p, status, updatedAt: new Date().toISOString() } : p
    );
    setProjects(next);
    try {
      await updateObraProject(projectId, { status });
    } catch (e) {
      console.error(e);
      setProjects(prev);
      alert("Não foi possível atualizar o status da obra.");
    }
  };

  // Inventory Management Functions
  const addInventoryItem = async (
    item: Omit<InventoryItem, "id" | "lastUpdated" | "alerts">
  ) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
      alerts: [],
    };
    await saveInventory([...inventory, newItem]);
    return newItem;
  };

  const applyInventoryEntry = async (entry: {
    projectId?: string;
    itemId: string;
    receivedAt: string;
    quantity: number;
    supplier?: string;
    category?: string;
    notes?: string;
  }) => {
    const target = inventory.find((i) => i.id === entry.itemId);
    if (!target) {
      alert("Selecione um item de estoque válido.");
      return;
    }
    if (!entry.receivedAt) {
      alert("Informe a data de recebimento.");
      return;
    }
    if (!Number.isFinite(entry.quantity) || entry.quantity <= 0) {
      alert("Informe uma quantidade válida (maior que zero).");
      return;
    }

    const now = new Date().toISOString();
    const movement: InventoryMovement = {
      id: Date.now().toString(),
      projectId: entry.projectId || target.projectId,
      itemId: target.id,
      type: "entrada",
      quantityDelta: entry.quantity,
      unit: target.unit,
      supplier: entry.supplier ?? target.supplier ?? "",
      category: entry.category ?? target.category ?? "",
      receivedAt: entry.receivedAt,
      notes: entry.notes ?? "",
      createdAt: now,
    };

    const nextInventory = inventory.map((i) =>
      i.id === target.id
        ? {
            ...i,
            quantity: (i.quantity ?? 0) + entry.quantity,
            supplier: entry.supplier ?? i.supplier,
            category: entry.category ?? i.category,
            lastUpdated: now,
          }
        : i
    );
    const nextMovements = [movement, ...inventoryMovements];

    await saveInventory(nextInventory);
    await saveInventoryMovements(nextMovements);
    alert("Entrada registrada com sucesso!");
  };

  // Inventory alerts are derived from scoped inventory via memo below.

  // Budget Management Functions
  const createBudget = async (
    budget: Omit<Budget, "id" | "createdAt" | "updatedAt">
  ) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveBudgets([...budgets, newBudget]);
    return newBudget;
  };

  // Supplier Management Functions
  const addSupplier = async (
    supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveSuppliers([...suppliers, newSupplier]);
    return newSupplier;
  };

  // Quality Management Functions
  const createQualityChecklist = async (
    checklist: Omit<QualityChecklist, "id" | "createdAt" | "updatedAt">
  ) => {
    const newChecklist: QualityChecklist = {
      ...checklist,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveQualityChecklists([...qualityChecklists, newChecklist]);
    return newChecklist;
  };

  const generateInventoryReport = useCallback(() => {
    const lowStock = scopedInventory.filter(
      (item) => item.quantity <= item.minStock
    );
    const totalValue = scopedInventory.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    const categories = [
      ...new Set(scopedInventory.map((item) => item.category)),
    ];

    return {
      totalItems: scopedInventory.length,
      lowStockItems: lowStock.length,
      totalValue,
      categories: categories.length,
      alerts: lowStock,
    };
  }, [scopedInventory]);

  // Handle new item creation
  const handleCreateProject = () => {
    const validation = validateProjectInput({
      name: newProject.name,
      client: newProject.client,
      description: newProject.description,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      budget: newProject.budget,
      labor: newProject.labor,
      team: newProject.team,
    });
    if (!validation.ok) {
      alert(validation.errors.join("\n"));
      return;
    }

    createProject({
      name: validation.value.name,
      description: validation.value.description,
      startDate: validation.value.startDate,
      endDate: validation.value.endDate,
      status: "planejamento",
      budget: validation.value.budget,
      spent: 0,
      progress: 0,
      milestones: [],
      team: validation.value.team,
      labor: validation.value.labor,
      client: validation.value.client,
    });

    alert("Obra cadastrada com sucesso!");
    resetNewProjectForm();
    setViewMode("projects");
  };

  const handleCreateInventoryItem = async () => {
    const validation = validateInventoryItemInput(newInventoryItem);
    if (!validation.ok) {
      alert(validation.errors.join("\n"));
      return;
    }

    await addInventoryItem({
      projectId: validation.value.projectId,
      name: validation.value.name,
      category: validation.value.category,
      quantity: validation.value.quantity,
      unit: validation.value.unit,
      minStock: validation.value.minStock,
      maxStock: validation.value.maxStock,
      price: validation.value.price,
      supplier: validation.value.supplier,
      location: validation.value.location,
    });

    alert("Item adicionado ao estoque com sucesso!");
    resetNewInventoryForm();
    setViewMode("inventory");
  };

  const handleCreateBudget = async () => {
    if (!newBudget.name || !newBudget.totalAmount) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    await createBudget({
      projectId: newBudget.projectId,
      name: newBudget.name,
      description: newBudget.description,
      totalAmount: newBudget.totalAmount,
      spentAmount: 0,
      categories: [],
    });

    alert("Orçamento criado com sucesso!");
    resetNewBudgetForm();
    setViewMode("budgets");
  };

  const handleCreateSupplier = async () => {
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.email) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    await addSupplier({
      projectId: newSupplier.projectId || undefined,
      name: newSupplier.name,
      contact: newSupplier.contact,
      email: newSupplier.email,
      phone: newSupplier.phone,
      address: newSupplier.address,
      category: newSupplier.category,
      rating: newSupplier.rating,
      reliability: newSupplier.reliability,
      deliveryTime: newSupplier.deliveryTime,
      paymentTerms: newSupplier.paymentTerms,
      notes: newSupplier.notes,
    });

    alert("Fornecedor cadastrado com sucesso!");
    resetNewSupplierForm();
    setViewMode("suppliers");
  };

  const handleCreateQualityChecklist = async () => {
    if (!newQualityChecklist.name || !newQualityChecklist.projectId) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    await createQualityChecklist({
      name: newQualityChecklist.name,
      description: newQualityChecklist.description,
      projectId: newQualityChecklist.projectId,
      status: "pendente",
      items: newQualityChecklist.items.map((item, index) => ({
        id: (index + 1).toString(),
        description: item.description,
        status: "pendente" as const,
        notes: "",
        responsible: item.responsible,
        checkedAt: "",
      })),
    });

    alert("Checklist de qualidade criado com sucesso!");
    resetNewQualityForm();
    setViewMode("quality");
  };

  const addQualityItem = () => {
    setNewQualityChecklist({
      ...newQualityChecklist,
      items: [
        ...newQualityChecklist.items,
        { description: "", responsible: "" },
      ],
    });
  };

  const removeQualityItem = (index: number) => {
    setNewQualityChecklist({
      ...newQualityChecklist,
      items: newQualityChecklist.items.filter((_, i) => i !== index),
    });
  };

  const inventoryReport = useMemo(() => generateInventoryReport(), [generateInventoryReport]);

  const stockCritical = useMemo(
    () => scopedInventory.filter((item) => (item.quantity ?? 0) <= 0),
    [scopedInventory]
  );
  const lowStockAlerts = useMemo(
    () => scopedInventory.filter((item) => (item.quantity ?? 0) <= (item.minStock ?? 0)),
    [scopedInventory]
  );

  return (
    <div className="obras-container">
      {/* Header */}
      <div className="obras-header">
        <div className="obras-header-inner">
          <div className="obras-header-left">
            <div className="obras-header-menu">
              <Button
                variant="secondary"
                className="obras-back-button"
                onClick={handleBack}
              >
                <FiArrowLeft size={16} />
                Voltar
              </Button>
              <Breadcrumb
                compact
                className="obras-header-breadcrumb"
                items={[
                  { label: "Acesso Exclusivo", to: paths.acessoExclusivo },
                  { label: "Gerenciamento de Obras" },
                ]}
              />
            </div>
          </div>
          <div className="obras-company-brand">
            <h1 className="obras-company-title">GERENCIAMENTO DE OBRAS</h1>
            <span className="obras-company-subtitle">
              Sistema completo de gestão de construção
            </span>
            <div className="obras-company-underline"></div>
          </div>
          <div className="obras-header-spacer"></div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "menu" && (
        <GerenciamentoObrasMenu
          counts={{
            projects: projects.length,
            diaries: diaryEntries.length,
            inventory: inventory.length,
            inventoryLow: lowStockAlerts.length,
            inventoryCritical: stockCritical.length,
            budgets: budgets.length,
            suppliers: suppliers.length,
            checklists: qualityChecklists.length,
          }}
          setViewMode={setViewMode}
          navigate={navigate}
        />
      )}

      {viewMode !== "menu" && viewMode !== "projects" && viewMode !== "project-overview" ? (
        <div className="obras-form-container" style={{ marginTop: -20 }}>
          <ProjectFilter
            projects={projects}
            value={projectFilterId}
            onChange={setProjectFilterId}
            helperText={
              projectFilterId
                ? `Exibindo dados vinculados à obra: ${
                    projects.find((p) => p.id === projectFilterId)?.name ?? ""
                  }`
                : "Exibindo dados de todas as obras."
            }
          />
        </div>
      ) : null}
      {(viewMode === "new" || viewMode === "edit") && (
        <DiarioObrasForm
          editingEntry={editingEntry}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProjectForEntry}
          obraName={obraName}
          setObraName={setObraName}
          date={date}
          setDate={setDate}
          responsible={responsible}
          setResponsible={setResponsible}
          weather={weather}
          setWeather={setWeather}
          status={status}
          setStatus={setStatus}
          activities={activities}
          setActivities={setActivities}
          materialName={materialName}
          setMaterialName={setMaterialName}
          materialQuantity={materialQuantity}
          setMaterialQuantity={setMaterialQuantity}
          materialUnit={materialUnit}
          setMaterialUnit={setMaterialUnit}
          materials={materials}
          onAddMaterial={handleAddMaterial}
          onRemoveMaterial={handleRemoveMaterial}
          photos={photos}
          onPhotoUpload={handlePhotoUpload}
          onRemovePhoto={handleRemovePhoto}
          onUpdatePhotoDescription={handleUpdatePhotoDescription}
          observations={observations}
          setObservations={setObservations}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
        />
      )}
      {viewMode === "history" && (
        <DiarioObrasHistory
          diaryEntries={scopedDiaryEntries}
          setViewMode={setViewMode}
          onEdit={handleEdit}
          onExportPdf={handleExportPDF}
          onDelete={handleDelete}
        />
      )}
      {viewMode === "projects" && (
        <ProjectManagement
          projects={projects}
          newProject={newProject}
          setNewProject={setNewProject}
          setViewMode={setViewMode}
          onResetNewProjectForm={resetNewProjectForm}
          onCreateProject={handleCreateProject}
          onOpenOverview={openProjectOverview}
          onUpdateProjectStatus={handleUpdateProjectStatus}
        />
      )}
      {viewMode === "project-overview" && (
        <ProjectOverview
          project={
            projects.find((p) => p.id === overviewProjectId) ??
            projects[0]
          }
          diaryEntries={diaryEntries}
          reports={reports}
          inventory={inventory}
          suppliers={suppliers}
          onOpenReport={openReportViewerFromOverview}
          onPrintProject={() => {
            const project =
              projects.find((p) => p.id === overviewProjectId) ?? projects[0];
            if (!project) return;
            const html = generateObraConsolidatedPdf({
              project,
              diaries: diaryEntries.filter((d) => d.projectId === project.id),
              inventory: inventory.filter((i) => i.projectId === project.id),
              suppliers: suppliers.filter((s) => s.projectId === project.id),
              reports: reports.filter((r) => r.projectId === project.id),
            });
            const w = window.open("", "_blank");
            if (!w) {
              alert("Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.");
              return;
            }
            w.document.write(html);
            w.document.close();
            w.print();
          }}
          setViewMode={setViewMode}
        />
      )}
      {viewMode === "inventory" && (
        <InventoryList
          inventory={scopedInventory}
          lowStockAlerts={lowStockAlerts}
          projects={projects}
          setViewMode={setViewMode}
          projectId={projectFilterId || undefined}
          onCreateNew={(ctx) => {
            if (ctx.projectId) {
              setNewInventoryItem((p) => ({ ...p, projectId: ctx.projectId ?? "" }));
            }
            setViewMode("new-inventory");
          }}
        />
      )}
      {viewMode === "inventory-entry" && (
        <InventoryEntryForm
          inventory={scopedInventory}
          suppliers={suppliers}
          projects={projects}
          projectFilterId={projectFilterId}
          onSubmit={applyInventoryEntry}
          setViewMode={setViewMode}
        />
      )}
      {viewMode === "inventory-movements" && (
        <InventoryMovementsList
          inventory={inventory}
          movements={inventoryMovements}
          suppliers={suppliers}
          projects={projects}
          projectFilterId={projectFilterId}
          setViewMode={setViewMode}
        />
      )}
      {viewMode === "budgets" && (
        <ObrasBudgetsPanel budgets={scopedBudgets} setViewMode={setViewMode} />
      )}
      {viewMode === "suppliers" && (
        <ObrasSuppliersPanel
          suppliers={scopedSuppliers}
          projects={projects}
          setViewMode={setViewMode}
          projectId={projectFilterId || undefined}
          onCreateNew={(ctx) => {
            if (ctx.projectId) {
              setNewSupplier((p) => ({ ...p, projectId: ctx.projectId ?? "" }));
            }
            setViewMode("new-supplier");
          }}
        />
      )}
      {viewMode === "quality" && (
        <ObrasQualityPanel
          qualityChecklists={scopedQualityChecklists}
          setViewMode={setViewMode}
        />
      )}
      {viewMode === "reports" && (
        <ObrasReportsPanel
          user={user}
          projects={projects}
          diaryEntries={scopedDiaryEntries}
          inventory={scopedInventory}
          suppliers={scopedSuppliers}
          reports={scopedReports}
          onDeleteReport={deleteReport}
          onEditReport={startEditingReport}
          onOpenReport={openReportViewerFromReportsPanel}
          projectCount={projectFilterId ? 1 : projects.length}
          inventoryReport={inventoryReport}
          setViewMode={setViewMode}
        />
      )}
      {viewMode === "reports-unified" && (
        <UnifiedReportsList
          user={user}
          projects={projects}
          reports={scopedReports}
          onOpenReport={openReportViewer}
          onEditReport={startEditingReport}
          onDeleteReport={deleteReport}
          setViewMode={setViewMode}
        />
      )}
      {viewMode === "report-viewer" && viewingReport && (
        <ReportViewer
          report={viewingReport}
          projects={projects}
          user={user}
          setViewMode={setViewMode}
          onFinalize={() => void finalizeReport(viewingReport.id)}
          onUnlockAdmin={() => void unlockReportForAdmin(viewingReport.id)}
          onUpdateReport={(id, updates) => updateReport(id, updates)}
          onBack={() => {
            setViewingReport(null);
            setViewMode(viewerBackMode);
          }}
        />
      )}
      {viewMode === "reports-select" && (
        <ReportsTypeSelector setViewMode={setViewMode} />
      )}
      {viewMode === "reports-rdo-new" && (
        <RDOForm
          projects={projects}
          initialProjectId={selectedProjectId}
          draftStorageKey={draftKey("rdo")}
          onCancel={() => setViewMode("reports-select")}
          onSubmit={async (report) => {
            const v = validateObraReportInput(report);
            if (!v.ok) {
              alert(v.errors.join("\n"));
              return;
            }
            await createRdoReport(report);
            alert("RDO salvo com sucesso!");
            setViewMode("reports");
          }}
        />
      )}
      {viewMode === "reports-rdo-edit" && (
        <RDOForm
          projects={projects}
          initialReport={editingReport?.type === "rdo" ? editingReport : undefined}
          onCancel={() => {
            setEditingReport(null);
            setViewMode("reports");
          }}
          onSubmit={async (report) => {
            if (!editingReport || editingReport.type !== "rdo") return;
            await updateReport(editingReport.id, report);
            alert("RDO atualizado com sucesso!");
            setEditingReport(null);
            setViewMode("reports");
          }}
        />
      )}
      {viewMode === "reports-expense-new" && (
        <ExpenseForm
          projects={projects}
          initialProjectId={selectedProjectId}
          draftStorageKey={draftKey("expense")}
          onCancel={() => setViewMode("reports-select")}
          onSubmit={async (report) => {
            const v = validateObraReportInput(report);
            if (!v.ok) {
              alert(v.errors.join("\n"));
              return;
            }
            await createExpenseReport(report);
            alert("Despesa salva com sucesso!");
            setViewMode("reports");
          }}
        />
      )}
      {viewMode === "reports-expense-edit" && (
        <ExpenseForm
          projects={projects}
          initialReport={editingReport?.type === "expense" ? editingReport : undefined}
          onCancel={() => {
            setEditingReport(null);
            setViewMode("reports");
          }}
          onSubmit={async (report) => {
            if (!editingReport || editingReport.type !== "expense") return;
            await updateReport(editingReport.id, report);
            alert("Despesa atualizada com sucesso!");
            setEditingReport(null);
            setViewMode("reports");
          }}
        />
      )}
      {viewMode === "reports-hydrostatic-new" && (
        <HydrostaticTestForm
          projects={projects}
          initialProjectId={selectedProjectId}
          draftStorageKey={draftKey("hydrostatic")}
          onCancel={() => setViewMode("reports-select")}
          onSubmit={async (report) => {
            const v = validateObraReportInput(report);
            if (!v.ok) {
              alert(v.errors.join("\n"));
              return;
            }
            await createHydrostaticTestReport(report);
            alert("Teste hidrostático salvo com sucesso!");
            setViewMode("reports");
          }}
        />
      )}
      {viewMode === "reports-hydrostatic-edit" && (
        <HydrostaticTestForm
          projects={projects}
          initialReport={
            editingReport?.type === "hydrostatic-test" ? editingReport : undefined
          }
          onCancel={() => {
            setEditingReport(null);
            setViewMode("reports");
          }}
          onSubmit={async (report) => {
            if (!editingReport || editingReport.type !== "hydrostatic-test") return;
            await updateReport(editingReport.id, report);
            alert("Teste hidrostático atualizado com sucesso!");
            setEditingReport(null);
            setViewMode("reports");
          }}
        />
      )}
      {viewMode === "reports-completion-new" && (
        <ProjectCompletionForm
          projects={projects}
          initialProjectId={selectedProjectId}
          draftStorageKey={draftKey("completion")}
          onCancel={() => setViewMode("reports-select")}
          onSubmit={async (report) => {
            const v = validateObraReportInput(report);
            if (!v.ok) {
              alert(v.errors.join("\n"));
              return;
            }
            await createProjectCompletionReport(report);
            alert("Conclusão de obra salva com sucesso!");
            setViewMode("reports");
          }}
        />
      )}
      {viewMode === "reports-completion-edit" && (
        <ProjectCompletionForm
          projects={projects}
          initialReport={
            editingReport?.type === "project-completion" ? editingReport : undefined
          }
          onCancel={() => {
            setEditingReport(null);
            setViewMode("reports");
          }}
          onSubmit={async (report) => {
            if (!editingReport || editingReport.type !== "project-completion") return;
            await updateReport(editingReport.id, report);
            alert("Conclusão de obra atualizada com sucesso!");
            setEditingReport(null);
            setViewMode("reports");
          }}
        />
      )}
      {viewMode === "new-inventory" && (
        <InventoryForm
          projects={projects}
          newInventoryItem={newInventoryItem}
          setNewInventoryItem={setNewInventoryItem}
          setViewMode={setViewMode}
          onSubmit={handleCreateInventoryItem}
        />
      )}
      {viewMode === "new-budget" && (
        <ObrasNewBudgetForm
          projects={projects}
          newBudget={newBudget}
          setNewBudget={setNewBudget}
          setViewMode={setViewMode}
          onSubmit={handleCreateBudget}
        />
      )}
      {viewMode === "new-supplier" && (
        <ObrasNewSupplierForm
          projects={projects}
          newSupplier={newSupplier}
          setNewSupplier={setNewSupplier}
          setViewMode={setViewMode}
          onSubmit={handleCreateSupplier}
        />
      )}
      {viewMode === "new-quality" && (
        <ObrasNewQualityForm
          projects={projects}
          newQualityChecklist={newQualityChecklist}
          setNewQualityChecklist={setNewQualityChecklist}
          setViewMode={setViewMode}
          onAddItem={addQualityItem}
          onRemoveItem={removeQualityItem}
          onSubmit={handleCreateQualityChecklist}
        />
      )}

      {/* Footer */}
      <div className="obras-footer">
        <img
          src="/HIDRODEMA_LogoNovo_Branco (2).png"
          alt="HIDRODEMA"
          className="obras-footer-logo"
        />
      </div>
    </div>
  );
}
