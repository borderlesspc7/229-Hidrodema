import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Toast from "../../../components/ui/Toast/Toast";
import {
  Menu,
  DiarioObrasForm,
  DiarioObrasHistory,
  ProjectsManagement,
  InventoryList,
  InventoryForm,
  BudgetsList,
  BudgetsForm,
  SuppliersList,
  SuppliersForm,
  TeamList,
  TeamForm,
  EquipmentList,
  EquipmentForm,
  ScheduleList,
  ScheduleForm,
  SafetyList,
  SafetyForm,
  MeasurementsList,
  MeasurementsForm,
  IssuesList,
  IssuesForm,
  DocumentsList,
  DocumentsForm,
  QualityList,
  QualityForm,
  ReportsDashboard,
} from "./components";
import {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  createDiaryEntry,
  getAllDiaryEntries,
  updateDiaryEntry,
  deleteDiaryEntry,
  createInventoryItem,
  getAllInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  createBudget,
  getAllBudgets,
  updateBudget,
  deleteBudget,
  createSupplier,
  getAllSuppliers,
  updateSupplier,
  deleteSupplier,
  createQualityChecklist,
  getAllQualityChecklists,
  updateQualityChecklist,
  deleteQualityChecklist,
  createTeamMember,
  getAllTeamMembers,
  updateTeamMember,
  deleteTeamMember,
  createEquipment,
  getAllEquipment,
  updateEquipment,
  deleteEquipment,
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
  createSafetyRecord,
  getAllSafetyRecords,
  updateSafetyRecord,
  deleteSafetyRecord,
  createMeasurement,
  getAllMeasurements,
  updateMeasurement,
  deleteMeasurement,
  createIssue,
  getAllIssues,
  updateIssue,
  deleteIssue,
  createDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
} from "../../../services/obrasService";
import type {
  Project,
  DiaryEntry,
  InventoryItem,
  Budget,
  Supplier,
  QualityChecklist,
  TeamMember,
  Equipment,
  Schedule,
  SafetyRecord,
  Measurement,
  Issue,
  DocumentRecord,
} from "../../../services/obrasService";
import type { Material, Photo, ViewMode } from "./types";
import "./GerenciamentoObras.css";

export default function GerenciamentoObras() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("menu");

  // Data states
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [qualityChecklists, setQualityChecklists] = useState<
    QualityChecklist[]
  >([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [safetyRecords, setSafetyRecords] = useState<SafetyRecord[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  // Editing states
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingInventoryItem, setEditingInventoryItem] =
    useState<InventoryItem | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(
    null
  );
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editingSafetyRecord, setEditingSafetyRecord] =
    useState<SafetyRecord | null>(null);
  const [editingMeasurement, setEditingMeasurement] =
    useState<Measurement | null>(null);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [editingDocument, setEditingDocument] = useState<DocumentRecord | null>(
    null
  );
  const [editingQualityChecklist, setEditingQualityChecklist] =
    useState<QualityChecklist | null>(null);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  // Form states for DiarioObras
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
  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materialUnit, setMaterialUnit] = useState("un");

  // Form states for Projects
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

  // Form states for Inventory
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

  // Form states for Budgets
  const [newBudget, setNewBudget] = useState({
    name: "",
    description: "",
    totalAmount: 0,
    projectId: "",
  });

  // Form states for Suppliers
  const [newSupplier, setNewSupplier] = useState({
    projectId: "",
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    rating: 0,
    reliability: "bom" as "excelente" | "bom" | "regular" | "ruim",
    deliveryTime: 0,
    paymentTerms: "",
    notes: "",
  });

  // Form states for Team
  const [newTeamMember, setNewTeamMember] = useState({
    projectId: "",
    name: "",
    role: "",
    cpf: "",
    phone: "",
    workHours: 0,
    hourlyRate: 0,
    attendance: false,
    checkInTime: "",
    checkOutTime: "",
  });

  // Form states for Equipment
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    type: "",
    code: "",
    status: "disponivel" as "disponivel" | "em-uso" | "manutencao" | "quebrado",
    projectId: "",
    lastMaintenance: "",
    nextMaintenance: "",
    operator: "",
    hoursUsed: 0,
    notes: "",
  });

  // Form states for Schedule
  const [newSchedule, setNewSchedule] = useState({
    projectId: "",
    taskName: "",
    startDate: "",
    endDate: "",
    progress: 0,
    responsible: "",
    status: "nao-iniciado" as
      | "nao-iniciado"
      | "em-andamento"
      | "concluido"
      | "atrasado",
    plannedCost: 0,
    actualCost: 0,
  });

  // Form states for Safety
  const [newSafetyRecord, setNewSafetyRecord] = useState({
    projectId: "",
    date: "",
    type: "dds" as "dds" | "inspecao" | "acidente" | "treinamento" | "epi",
    title: "",
    description: "",
    responsible: "",
    severity: "baixa" as "baixa" | "media" | "alta",
    correctedActions: "",
    status: "pendente" as "pendente" | "em-andamento" | "concluido",
  });

  // Form states for Measurements
  const [newMeasurement, setNewMeasurement] = useState({
    projectId: "",
    date: "",
    period: "",
    description: "",
    plannedPhysicalProgress: 0,
    actualPhysicalProgress: 0,
    plannedFinancialProgress: 0,
    actualFinancialProgress: 0,
    observations: "",
    approved: false,
    approvedBy: "",
  });

  // Form states for Issues
  const [newIssue, setNewIssue] = useState({
    projectId: "",
    date: "",
    title: "",
    description: "",
    category: "tecnico" as
      | "tecnico"
      | "financeiro"
      | "prazo"
      | "qualidade"
      | "seguranca"
      | "outro",
    priority: "media" as "baixa" | "media" | "alta" | "critica",
    status: "aberto" as "aberto" | "em-analise" | "resolvido" | "cancelado",
    responsible: "",
    solution: "",
    solvedDate: "",
  });

  // Form states for Documents
  const [newDocument, setNewDocument] = useState({
    projectId: "",
    name: "",
    type: "projeto" as
      | "projeto"
      | "art"
      | "contrato"
      | "licenca"
      | "orcamento"
      | "medicao"
      | "outro",
    uploadDate: "",
    fileUrl: "",
    description: "",
    version: "",
    uploadedBy: "",
  });

  // Form states for Quality
  const [newQualityChecklist, setNewQualityChecklist] = useState({
    projectId: "",
    name: "",
    description: "",
    status: "pendente" as "pendente" | "em-andamento" | "concluida",
    createdBy: "",
  });

  const showToastMessage = useCallback(
    (message: string, type: "success" | "error" | "warning" | "info") => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
    },
    []
  );

  const loadData = useCallback(async () => {
    try {
      const [
        diaries,
        projectsData,
        inventoryData,
        budgetsData,
        suppliersData,
        checklistsData,
        teamMembersData,
        equipmentData,
        schedulesData,
        safetyRecordsData,
        measurementsData,
        issuesData,
        documentsData,
      ] = await Promise.all([
        getAllDiaryEntries(),
        getAllProjects(),
        getAllInventoryItems(),
        getAllBudgets(),
        getAllSuppliers(),
        getAllQualityChecklists(),
        getAllTeamMembers(),
        getAllEquipment(),
        getAllSchedules(),
        getAllSafetyRecords(),
        getAllMeasurements(),
        getAllIssues(),
        getAllDocuments(),
      ]);

      setDiaryEntries(diaries);
      setProjects(projectsData);
      setInventory(inventoryData);
      setBudgets(budgetsData);
      setSuppliers(suppliersData);
      setQualityChecklists(checklistsData);
      setTeamMembers(teamMembersData);
      setEquipment(equipmentData);
      setSchedules(schedulesData);
      setSafetyRecords(safetyRecordsData);
      setMeasurements(measurementsData);
      setIssues(issuesData);
      setDocuments(documentsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showToastMessage(
        "Erro ao carregar dados. Por favor, recarregue a página.",
        "error"
      );
    }
  }, [showToastMessage]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = loadData;

  // Helper function for inventory alerts
  const checkInventoryAlerts = () => {
    return inventory.filter((item) => item.quantity <= item.minStock);
  };

  // DiarioObras handlers
  const handleAddMaterial = () => {
    if (!materialName || !materialQuantity) {
      showToastMessage("Preencha o nome e quantidade do material", "warning");
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

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photo: Photo = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          description: "",
          dataUrl: event.target?.result as string,
        };
        setPhotos((prev) => [...prev, photo]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (id: string) => {
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
    if (!obraName || !date) {
      showToastMessage(
        "Preencha pelo menos o nome da obra e a data",
        "warning"
      );
      return;
    }

    try {
      const entryData: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt"> = {
        projectId: selectedProjectId || undefined,
        obraName,
        date,
        activities,
        materials,
        photos,
        observations,
        weather,
        responsible,
        status,
      };

      if (editingEntry && editingEntry.id) {
        await updateDiaryEntry(editingEntry.id, entryData);
        showToastMessage("Registro atualizado com sucesso!", "success");
      } else {
        await createDiaryEntry(entryData);
        showToastMessage("Rascunho salvo com sucesso!", "success");
      }

      await refreshData();
      resetDiarioForm();
      setViewMode("history");
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      showToastMessage("Erro ao salvar registro. Tente novamente.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!obraName || !date || !activities) {
      showToastMessage("Preencha todos os campos obrigatórios", "warning");
      return;
    }

    try {
      const entryData: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt"> = {
        projectId: selectedProjectId || undefined,
        obraName,
        date,
        activities,
        materials,
        photos,
        observations,
        weather,
        responsible,
        status,
      };

      if (editingEntry && editingEntry.id) {
        await updateDiaryEntry(editingEntry.id, entryData);
        showToastMessage("Registro atualizado com sucesso!", "success");
      } else {
        await createDiaryEntry(entryData);
        showToastMessage("Registro salvo com sucesso!", "success");
      }

      await refreshData();
      resetDiarioForm();
      setViewMode("history");
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      showToastMessage("Erro ao salvar registro. Tente novamente.", "error");
    }
  };

  const handleEditDiary = (entry: DiaryEntry) => {
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
    const matchingProject = projects.find((p) => p.name === entry.obraName);
    setSelectedProjectId(matchingProject?.id || "");
    setViewMode("edit");
  };

  const handleDeleteDiary = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      try {
        await deleteDiaryEntry(id);
        await refreshData();
        showToastMessage("Registro excluído com sucesso!", "success");
      } catch (error) {
        console.error("Erro ao excluir registro:", error);
        showToastMessage("Erro ao excluir registro. Tente novamente.", "error");
      }
    }
  };

  const handleExportPDF = (entry: DiaryEntry) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Diário de Obra - ${entry.obraName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              .label { font-weight: bold; color: #1e40af; }
              .value { margin-left: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>DIÁRIO DE OBRA</h1>
              <h2>${entry.obraName}</h2>
              <p>Data: ${new Date(entry.date).toLocaleDateString()}</p>
            </div>
            <div class="section">
              <p><span class="label">Responsável:</span><span class="value">${
                entry.responsible || "Não informado"
              }</span></p>
              <p><span class="label">Clima:</span><span class="value">${
                entry.weather || "Não informado"
              }</span></p>
            </div>
            <div class="section">
              <h3>Atividades</h3>
              <p>${entry.activities}</p>
            </div>
            <div class="section">
              <h3>Observações</h3>
              <p>${entry.observations || "Nenhuma observação"}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const resetDiarioForm = () => {
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

  // Projects handlers
  const handleProjectChange = (field: string, value: string | number) => {
    setNewProject((prev) => ({ ...prev, [field]: value }));
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
    setEditingProject(null);
  };

  const handleCreateProject = async () => {
    if (
      !newProject.name ||
      !newProject.client ||
      !newProject.startDate ||
      !newProject.endDate
    ) {
      showToastMessage("Preencha todos os campos obrigatórios", "warning");
      return;
    }

    try {
      const projectData: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
        name: newProject.name,
        description: newProject.description,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        client: newProject.client,
        budget: newProject.budget,
        spent: 0,
        progress: 0,
        status: "planejamento",
        milestones: [],
        team: newProject.team,
        labor: newProject.labor,
      };

      if (editingProject && editingProject.id) {
        await updateProject(editingProject.id, projectData);
        showToastMessage("Obra atualizada com sucesso!", "success");
      } else {
        await createProject(projectData);
        showToastMessage("Obra cadastrada com sucesso!", "success");
      }

      await refreshData();
      resetNewProjectForm();
    } catch (error) {
      console.error("Erro ao salvar obra:", error);
      showToastMessage("Erro ao salvar obra. Tente novamente.", "error");
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      client: project.client,
      budget: project.budget,
      team: project.team || [],
      labor: project.labor || "",
    });
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta obra?")) {
      try {
        await deleteProject(id);
        await refreshData();
        showToastMessage("Obra excluída com sucesso!", "success");
      } catch (error) {
        console.error("Erro ao excluir obra:", error);
        showToastMessage("Erro ao excluir obra. Tente novamente.", "error");
      }
    }
  };

  // Inventory handlers
  const handleInventoryChange = (field: string, value: string | number) => {
    setNewInventoryItem((prev) => ({ ...prev, [field]: value }));
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
    setEditingInventoryItem(null);
  };

  const handleCreateInventoryItem = async () => {
    if (!newInventoryItem.name || !newInventoryItem.category) {
      showToastMessage("Preencha todos os campos obrigatórios", "warning");
      return;
    }

    try {
      const itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt"> = {
        ...newInventoryItem,
        lastUpdated: new Date().toISOString(),
        alerts: [],
      };

      if (editingInventoryItem && editingInventoryItem.id) {
        await updateInventoryItem(editingInventoryItem.id, itemData);
        showToastMessage("Item atualizado com sucesso!", "success");
      } else {
        await createInventoryItem(itemData);
        showToastMessage("Item cadastrado com sucesso!", "success");
      }

      await refreshData();
      resetNewInventoryForm();
      setViewMode("inventory");
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      showToastMessage("Erro ao salvar item. Tente novamente.", "error");
    }
  };

  const handleEditInventoryItem = (item: InventoryItem) => {
    setEditingInventoryItem(item);
    setNewInventoryItem({
      projectId: item.projectId || "",
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minStock: item.minStock,
      maxStock: item.maxStock,
      price: item.price,
      supplier: item.supplier,
      location: item.location,
    });
    setViewMode("new-inventory");
  };

  const handleDeleteInventoryItem = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      try {
        await deleteInventoryItem(id);
        await refreshData();
        showToastMessage("Item excluído com sucesso!", "success");
      } catch (error) {
        console.error("Erro ao excluir item:", error);
        showToastMessage("Erro ao excluir item. Tente novamente.", "error");
      }
    }
  };

  // Budget handlers
  const handleBudgetChange = (field: string, value: string | number) => {
    setNewBudget((prev) => ({ ...prev, [field]: value }));
  };

  const resetNewBudgetForm = () => {
    setNewBudget({
      name: "",
      description: "",
      totalAmount: 0,
      projectId: "",
    });
    setEditingBudget(null);
  };

  const handleCreateBudget = async () => {
    if (!newBudget.name || !newBudget.totalAmount) {
      showToastMessage("Preencha todos os campos obrigatórios", "warning");
      return;
    }

    try {
      const budgetData: Omit<Budget, "id" | "createdAt" | "updatedAt"> = {
        name: newBudget.name,
        description: newBudget.description,
        totalAmount: newBudget.totalAmount,
        spentAmount: 0,
        projectId: newBudget.projectId || "",
        categories: [],
      };

      if (editingBudget && editingBudget.id) {
        await updateBudget(editingBudget.id, budgetData);
        showToastMessage("Orçamento atualizado com sucesso!", "success");
      } else {
        await createBudget(budgetData);
        showToastMessage("Orçamento cadastrado com sucesso!", "success");
      }

      await refreshData();
      resetNewBudgetForm();
      setViewMode("budgets");
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      showToastMessage("Erro ao salvar orçamento. Tente novamente.", "error");
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setNewBudget({
      name: budget.name,
      description: budget.description,
      totalAmount: budget.totalAmount,
      projectId: budget.projectId || "",
    });
    setViewMode("new-budget");
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      try {
        await deleteBudget(id);
        await refreshData();
        showToastMessage("Orçamento excluído com sucesso!", "success");
      } catch (error) {
        console.error("Erro ao excluir orçamento:", error);
        showToastMessage(
          "Erro ao excluir orçamento. Tente novamente.",
          "error"
        );
      }
    }
  };

  // Generic handlers for all new modules
  const createGenericHandlers = <T extends { id?: string }>(
    createFn: (
      data: Omit<T, "id" | "createdAt" | "updatedAt">
    ) => Promise<string | T>,
    updateFn: (
      id: string,
      data: Omit<T, "id" | "createdAt" | "updatedAt">
    ) => Promise<void>,
    deleteFn: (id: string) => Promise<void>,
    entityName: string
  ) => ({
    handleCreate: async (
      data: Omit<T, "id" | "createdAt" | "updatedAt">,
      editingItem: T | null
    ) => {
      try {
        if (editingItem && editingItem.id) {
          await updateFn(editingItem.id, data);
          showToastMessage(`${entityName} atualizado com sucesso!`, "success");
        } else {
          await createFn(data);
          showToastMessage(`${entityName} cadastrado com sucesso!`, "success");
        }
        await refreshData();
        return true;
      } catch (error) {
        console.error(`Erro ao salvar ${entityName}:`, error);
        showToastMessage(
          `Erro ao salvar ${entityName}. Tente novamente.`,
          "error"
        );
        return false;
      }
    },
    handleDelete: async (id: string) => {
      if (confirm(`Tem certeza que deseja excluir este ${entityName}?`)) {
        try {
          await deleteFn(id);
          await refreshData();
          showToastMessage(`${entityName} excluído com sucesso!`, "success");
        } catch (error) {
          console.error(`Erro ao excluir ${entityName}:`, error);
          showToastMessage(
            `Erro ao excluir ${entityName}. Tente novamente.`,
            "error"
          );
        }
      }
    },
  });

  // Suppliers handlers
  const supplierHandlers = createGenericHandlers(
    createSupplier,
    updateSupplier,
    deleteSupplier,
    "Fornecedor"
  );
  const handleSupplierChange = (field: string, value: string | number) => {
    setNewSupplier((prev) => ({ ...prev, [field]: value }));
  };

  // Team handlers
  const teamHandlers = createGenericHandlers(
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    "Membro"
  );
  const handleTeamChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setNewTeamMember((prev) => ({ ...prev, [field]: value }));
  };

  // Equipment handlers
  const equipmentHandlers = createGenericHandlers(
    createEquipment,
    updateEquipment,
    deleteEquipment,
    "Equipamento"
  );
  const handleEquipmentChange = (field: string, value: string | number) => {
    setNewEquipment((prev) => ({ ...prev, [field]: value }));
  };

  // Schedule handlers
  const scheduleHandlers = createGenericHandlers(
    createSchedule,
    updateSchedule,
    deleteSchedule,
    "Tarefa"
  );
  const handleScheduleChange = (field: string, value: string | number) => {
    setNewSchedule((prev) => ({ ...prev, [field]: value }));
  };

  // Safety handlers
  const safetyHandlers = createGenericHandlers(
    createSafetyRecord,
    updateSafetyRecord,
    deleteSafetyRecord,
    "Registro"
  );
  const handleSafetyChange = (field: string, value: string) => {
    setNewSafetyRecord((prev) => ({ ...prev, [field]: value }));
  };

  // Measurements handlers
  const measurementHandlers = createGenericHandlers(
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
    "Medição"
  );
  const handleMeasurementChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setNewMeasurement((prev) => ({ ...prev, [field]: value }));
  };

  // Issues handlers
  const issueHandlers = createGenericHandlers(
    createIssue,
    updateIssue,
    deleteIssue,
    "Problema"
  );
  const handleIssueChange = (field: string, value: string) => {
    setNewIssue((prev) => ({ ...prev, [field]: value }));
  };

  // Documents handlers
  const documentHandlers = createGenericHandlers(
    createDocument,
    updateDocument,
    deleteDocument,
    "Documento"
  );
  const handleDocumentChange = (field: string, value: string) => {
    setNewDocument((prev) => ({ ...prev, [field]: value }));
  };

  // Quality handlers
  const qualityHandlers = createGenericHandlers(
    createQualityChecklist,
    updateQualityChecklist,
    deleteQualityChecklist,
    "Checklist"
  );
  const handleQualityChange = (field: string, value: string) => {
    setNewQualityChecklist((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    if (viewMode === "menu") {
      navigate("/acesso-exclusivo");
    } else {
      setViewMode("menu");
      resetDiarioForm();
      resetNewProjectForm();
      resetNewInventoryForm();
      resetNewBudgetForm();
    }
  };

  // Render logic
  const renderContent = () => {
    switch (viewMode) {
      case "menu":
        return (
          <Menu
            projects={projects}
            diaryEntries={diaryEntries}
            inventory={inventory}
            budgets={budgets}
            suppliers={suppliers}
            qualityChecklists={qualityChecklists}
            teamMembers={teamMembers}
            equipment={equipment}
            schedules={schedules}
            safetyRecords={safetyRecords}
            measurements={measurements}
            issues={issues}
            documents={documents}
            onViewChange={setViewMode}
          />
        );

      case "new":
      case "edit":
        return (
          <DiarioObrasForm
            projects={projects}
            editingEntry={editingEntry}
            obraName={obraName}
            date={date}
            activities={activities}
            materials={materials}
            photos={photos}
            observations={observations}
            weather={weather}
            responsible={responsible}
            status={status}
            selectedProjectId={selectedProjectId}
            materialName={materialName}
            materialQuantity={materialQuantity}
            materialUnit={materialUnit}
            onObraNameChange={setObraName}
            onDateChange={setDate}
            onActivitiesChange={setActivities}
            onObservationsChange={setObservations}
            onWeatherChange={setWeather}
            onResponsibleChange={setResponsible}
            onStatusChange={setStatus}
            onMaterialNameChange={setMaterialName}
            onMaterialQuantityChange={setMaterialQuantity}
            onMaterialUnitChange={setMaterialUnit}
            onSelectProject={handleSelectProjectForEntry}
            onAddMaterial={handleAddMaterial}
            onRemoveMaterial={handleRemoveMaterial}
            onPhotoUpload={handlePhotoUpload}
            onRemovePhoto={handleRemovePhoto}
            onUpdatePhotoDescription={handleUpdatePhotoDescription}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
          />
        );

      case "history":
        return (
          <DiarioObrasHistory
            diaryEntries={diaryEntries}
            onViewChange={setViewMode}
            onEdit={handleEditDiary}
            onDelete={handleDeleteDiary}
            onExportPDF={handleExportPDF}
          />
        );

      case "projects":
        return (
          <ProjectsManagement
            projects={projects}
            editingProject={editingProject}
            newProject={newProject}
            onViewChange={setViewMode}
            onProjectChange={handleProjectChange}
            onResetForm={resetNewProjectForm}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        );

      case "inventory":
        return (
          <InventoryList
            inventory={inventory}
            alerts={checkInventoryAlerts()}
            onViewChange={setViewMode}
            onEdit={handleEditInventoryItem}
            onDelete={handleDeleteInventoryItem}
          />
        );

      case "new-inventory":
        return (
          <InventoryForm
            projects={projects}
            formData={newInventoryItem}
            editingItem={editingInventoryItem}
            onChange={handleInventoryChange}
            onSubmit={handleCreateInventoryItem}
            onReset={resetNewInventoryForm}
            onBack={() => setViewMode("inventory")}
          />
        );

      case "budgets":
        return (
          <BudgetsList
            budgets={budgets}
            onViewChange={setViewMode}
            onEdit={handleEditBudget}
            onDelete={handleDeleteBudget}
          />
        );

      case "new-budget":
        return (
          <BudgetsForm
            formData={newBudget}
            projects={projects}
            editingItem={editingBudget}
            onChange={handleBudgetChange}
            onSubmit={handleCreateBudget}
            onReset={resetNewBudgetForm}
            onBack={() => setViewMode("budgets")}
          />
        );

      case "suppliers":
        return (
          <SuppliersList
            suppliers={suppliers}
            onViewChange={setViewMode}
            onEdit={(supplier) => {
              setEditingSupplier(supplier);
              setNewSupplier({
                projectId: supplier.projectId || "",
                name: supplier.name,
                contact: supplier.contact,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                category: supplier.category,
                rating: supplier.rating,
                reliability: supplier.reliability,
                deliveryTime: supplier.deliveryTime,
                paymentTerms: supplier.paymentTerms,
                notes: supplier.notes,
              });
              setViewMode("new-supplier");
            }}
            onDelete={supplierHandlers.handleDelete}
          />
        );

      case "new-supplier":
        return (
          <SuppliersForm
            projects={projects}
            formData={newSupplier}
            editingItem={editingSupplier}
            onChange={handleSupplierChange}
            onSubmit={async () => {
              if (!newSupplier.name || !newSupplier.category) {
                showToastMessage(
                  "Preencha todos os campos obrigatórios",
                  "warning"
                );
                return;
              }
              const success = await supplierHandlers.handleCreate(
                newSupplier,
                editingSupplier
              );
              if (success) {
                setNewSupplier({
                  projectId: "",
                  name: "",
                  contact: "",
                  email: "",
                  phone: "",
                  address: "",
                  category: "",
                  rating: 0,
                  reliability: "bom",
                  deliveryTime: 0,
                  paymentTerms: "",
                  notes: "",
                });
                setEditingSupplier(null);
                setViewMode("suppliers");
              }
            }}
            onReset={() => {
              setNewSupplier({
                name: "",
                contact: "",
                email: "",
                phone: "",
                address: "",
                category: "",
                rating: 0,
                reliability: "bom",
                deliveryTime: 0,
                paymentTerms: "",
                notes: "",
              });
              setEditingSupplier(null);
            }}
            onBack={() => setViewMode("suppliers")}
          />
        );

      case "team":
        return (
          <TeamList
            teamMembers={teamMembers}
            onViewChange={setViewMode}
            onEdit={(member) => {
              setEditingTeamMember(member);
              setNewTeamMember({
                projectId: member.projectId || "",
                name: member.name,
                role: member.role,
                cpf: member.cpf || "",
                phone: member.phone || "",
                workHours: member.workHours || 0,
                hourlyRate: member.hourlyRate || 0,
                attendance: member.attendance || false,
                checkInTime: member.checkInTime || "",
                checkOutTime: member.checkOutTime || "",
              });
              setViewMode("new-team");
            }}
            onDelete={teamHandlers.handleDelete}
          />
        );

      case "new-team":
        return (
          <TeamForm
            projects={projects}
            formData={newTeamMember}
            editingItem={editingTeamMember}
            onChange={handleTeamChange}
            onSubmit={async () => {
              if (!newTeamMember.name || !newTeamMember.role) {
                showToastMessage(
                  "Preencha todos os campos obrigatórios",
                  "warning"
                );
                return;
              }
              const success = await teamHandlers.handleCreate(
                newTeamMember,
                editingTeamMember
              );
              if (success) {
                setNewTeamMember({
                  projectId: "",
                  name: "",
                  role: "",
                  cpf: "",
                  phone: "",
                  workHours: 0,
                  hourlyRate: 0,
                  attendance: false,
                  checkInTime: "",
                  checkOutTime: "",
                });
                setEditingTeamMember(null);
                setViewMode("team");
              }
            }}
            onReset={() => {
              setNewTeamMember({
                name: "",
                role: "",
                cpf: "",
                phone: "",
                workHours: 0,
                hourlyRate: 0,
                attendance: false,
                checkInTime: "",
                checkOutTime: "",
              });
              setEditingTeamMember(null);
            }}
            onBack={() => setViewMode("team")}
          />
        );

      case "equipment":
        return (
          <EquipmentList
            equipment={equipment}
            onViewChange={setViewMode}
            onEdit={(item) => {
              setEditingEquipment(item);
              setNewEquipment({
                name: item.name,
                type: item.type,
                code: item.code || "",
                status: item.status,
                projectId: item.projectId || "",
                lastMaintenance: item.lastMaintenance || "",
                nextMaintenance: item.nextMaintenance || "",
                operator: item.operator || "",
                hoursUsed: item.hoursUsed || 0,
                notes: item.notes || "",
              });
              setViewMode("new-equipment");
            }}
            onDelete={equipmentHandlers.handleDelete}
          />
        );

      case "new-equipment":
        return (
          <EquipmentForm
            projects={projects}
            formData={newEquipment}
            editingItem={editingEquipment}
            onChange={handleEquipmentChange}
            onSubmit={async () => {
              if (!newEquipment.name || !newEquipment.type) {
                showToastMessage(
                  "Preencha todos os campos obrigatórios",
                  "warning"
                );
                return;
              }
              const success = await equipmentHandlers.handleCreate(
                newEquipment,
                editingEquipment
              );
              if (success) {
                setNewEquipment({
                  name: "",
                  type: "",
                  code: "",
                  status: "disponivel",
                  projectId: "",
                  lastMaintenance: "",
                  nextMaintenance: "",
                  operator: "",
                  hoursUsed: 0,
                  notes: "",
                });
                setEditingEquipment(null);
                setViewMode("equipment");
              }
            }}
            onReset={() => {
              setNewEquipment({
                name: "",
                type: "",
                code: "",
                status: "disponivel",
                projectId: "",
                lastMaintenance: "",
                nextMaintenance: "",
                operator: "",
                hoursUsed: 0,
                notes: "",
              });
              setEditingEquipment(null);
            }}
            onBack={() => setViewMode("equipment")}
          />
        );

      case "schedule":
        return (
          <ScheduleList
            schedules={schedules}
            onViewChange={setViewMode}
            onEdit={(schedule) => {
              setEditingSchedule(schedule);
              setNewSchedule({
                projectId: schedule.projectId,
                taskName: schedule.taskName,
                startDate: schedule.startDate,
                endDate: schedule.endDate,
                progress: schedule.progress,
                responsible: schedule.responsible || "",
                status: schedule.status,
                plannedCost: schedule.plannedCost || 0,
                actualCost: schedule.actualCost || 0,
              });
              setViewMode("new-schedule");
            }}
            onDelete={scheduleHandlers.handleDelete}
          />
        );

      case "new-schedule":
        return (
          <ScheduleForm
            formData={newSchedule}
            projects={projects}
            editingItem={editingSchedule}
            onChange={handleScheduleChange}
            onSubmit={async () => {
              if (
                !newSchedule.taskName ||
                !newSchedule.startDate ||
                !newSchedule.endDate
              ) {
                showToastMessage(
                  "Preencha todos os campos obrigatórios",
                  "warning"
                );
                return;
              }
              const success = await scheduleHandlers.handleCreate(
                newSchedule,
                editingSchedule
              );
              if (success) {
                setNewSchedule({
                  projectId: "",
                  taskName: "",
                  startDate: "",
                  endDate: "",
                  progress: 0,
                  responsible: "",
                  status: "nao-iniciado",
                  plannedCost: 0,
                  actualCost: 0,
                });
                setEditingSchedule(null);
                setViewMode("schedule");
              }
            }}
            onReset={() => {
              setNewSchedule({
                projectId: "",
                taskName: "",
                startDate: "",
                endDate: "",
                progress: 0,
                responsible: "",
                status: "nao-iniciado",
                plannedCost: 0,
                actualCost: 0,
              });
              setEditingSchedule(null);
            }}
            onBack={() => setViewMode("schedule")}
          />
        );

      case "safety":
        return (
          <SafetyList
            safetyRecords={safetyRecords}
            onViewChange={setViewMode}
            onEdit={(record) => {
              setEditingSafetyRecord(record);
              setNewSafetyRecord({
                projectId: record.projectId,
                date: record.date,
                type: record.type,
                title: record.title,
                description: record.description,
                responsible: record.responsible,
                severity: record.severity || "baixa",
                correctedActions: record.correctedActions || "",
                status: record.status,
              });
              setViewMode("new-safety");
            }}
            onDelete={safetyHandlers.handleDelete}
          />
        );

      case "new-safety":
        return (
          <SafetyForm
            formData={newSafetyRecord}
            projects={projects}
            editingItem={editingSafetyRecord}
            onChange={handleSafetyChange}
            onSubmit={async () => {
              if (
                !newSafetyRecord.date ||
                !newSafetyRecord.title ||
                !newSafetyRecord.description ||
                !newSafetyRecord.responsible
              ) {
                showToastMessage(
                  "Preencha todos os campos obrigatórios",
                  "warning"
                );
                return;
              }
              const success = await safetyHandlers.handleCreate(
                newSafetyRecord,
                editingSafetyRecord
              );
              if (success) {
                setNewSafetyRecord({
                  projectId: "",
                  date: "",
                  type: "dds",
                  title: "",
                  description: "",
                  responsible: "",
                  severity: "baixa",
                  correctedActions: "",
                  status: "pendente",
                });
                setEditingSafetyRecord(null);
                setViewMode("safety");
              }
            }}
            onReset={() => {
              setNewSafetyRecord({
                projectId: "",
                date: "",
                type: "dds",
                title: "",
                description: "",
                responsible: "",
                severity: "baixa",
                correctedActions: "",
                status: "pendente",
              });
              setEditingSafetyRecord(null);
            }}
            onBack={() => setViewMode("safety")}
          />
        );

      case "measurements":
        return (
          <MeasurementsList
            measurements={measurements}
            onViewChange={setViewMode}
            onEdit={(measurement) => {
              setEditingMeasurement(measurement);
              setNewMeasurement({
                projectId: measurement.projectId,
                date: measurement.date,
                period: measurement.period,
                description: measurement.description,
                plannedPhysicalProgress: measurement.plannedPhysicalProgress,
                actualPhysicalProgress: measurement.actualPhysicalProgress,
                plannedFinancialProgress: measurement.plannedFinancialProgress,
                actualFinancialProgress: measurement.actualFinancialProgress,
                observations: measurement.observations || "",
                approved: measurement.approved || false,
                approvedBy: measurement.approvedBy || "",
              });
              setViewMode("new-measurements");
            }}
            onDelete={measurementHandlers.handleDelete}
          />
        );

      case "new-measurements":
        return (
          <MeasurementsForm
            formData={newMeasurement}
            projects={projects}
            editingItem={editingMeasurement}
            onChange={handleMeasurementChange}
            onSubmit={async () => {
              if (
                !newMeasurement.date ||
                !newMeasurement.period ||
                !newMeasurement.description
              ) {
                showToastMessage(
                  "Preencha todos os campos obrigatórios",
                  "warning"
                );
                return;
              }
              const success = await measurementHandlers.handleCreate(
                newMeasurement,
                editingMeasurement
              );
              if (success) {
                setNewMeasurement({
                  projectId: "",
                  date: "",
                  period: "",
                  description: "",
                  plannedPhysicalProgress: 0,
                  actualPhysicalProgress: 0,
                  plannedFinancialProgress: 0,
                  actualFinancialProgress: 0,
                  observations: "",
                  approved: false,
                  approvedBy: "",
                });
                setEditingMeasurement(null);
                setViewMode("measurements");
              }
            }}
            onReset={() => {
              setNewMeasurement({
                projectId: "",
                date: "",
                period: "",
                description: "",
                plannedPhysicalProgress: 0,
                actualPhysicalProgress: 0,
                plannedFinancialProgress: 0,
                actualFinancialProgress: 0,
                observations: "",
                approved: false,
                approvedBy: "",
              });
              setEditingMeasurement(null);
            }}
            onBack={() => setViewMode("measurements")}
          />
        );

      case "issues":
        return (
          <IssuesList
            issues={issues}
            onViewChange={setViewMode}
            onEdit={(issue) => {
              setEditingIssue(issue);
              setNewIssue({
                projectId: issue.projectId,
                date: issue.date,
                title: issue.title,
                description: issue.description,
                category: issue.category,
                priority: issue.priority,
                status: issue.status,
                responsible: issue.responsible || "",
                solution: issue.solution || "",
                solvedDate: issue.solvedDate || "",
              });
              setViewMode("new-issues");
            }}
            onDelete={issueHandlers.handleDelete}
          />
        );

      case "new-issues":
        return (
          <IssuesForm
            formData={newIssue}
            projects={projects}
            editingItem={editingIssue}
            onChange={handleIssueChange}
            onSubmit={async () => {
              if (!newIssue.date || !newIssue.title || !newIssue.description) {
                showToastMessage(
                  "Preencha todos os campos obrigatórios",
                  "warning"
                );
                return;
              }
              const success = await issueHandlers.handleCreate(
                newIssue,
                editingIssue
              );
              if (success) {
                setNewIssue({
                  projectId: "",
                  date: "",
                  title: "",
                  description: "",
                  category: "tecnico",
                  priority: "media",
                  status: "aberto",
                  responsible: "",
                  solution: "",
                  solvedDate: "",
                });
                setEditingIssue(null);
                setViewMode("issues");
              }
            }}
            onReset={() => {
              setNewIssue({
                projectId: "",
                date: "",
                title: "",
                description: "",
                category: "tecnico",
                priority: "media",
                status: "aberto",
                responsible: "",
                solution: "",
                solvedDate: "",
              });
              setEditingIssue(null);
            }}
            onBack={() => setViewMode("issues")}
          />
        );

      case "documents":
        return (
          <DocumentsList
            documents={documents}
            onViewChange={setViewMode}
            onEdit={(doc) => {
              setEditingDocument(doc);
              setNewDocument({
                projectId: doc.projectId,
                name: doc.name,
                type: doc.type,
                uploadDate: doc.uploadDate,
                fileUrl: doc.fileUrl || "",
                description: doc.description || "",
                version: doc.version || "",
                uploadedBy: doc.uploadedBy || "",
              });
              setViewMode("new-documents");
            }}
            onDelete={documentHandlers.handleDelete}
          />
        );

      case "new-documents":
        return (
          <DocumentsForm
            formData={newDocument}
            projects={projects}
            editingItem={editingDocument}
            onChange={handleDocumentChange}
            onSubmit={async () => {
              if (!newDocument.name) {
                showToastMessage(
                  "Preencha todos os campos obrigatórios",
                  "warning"
                );
                return;
              }
              const success = await documentHandlers.handleCreate(
                {
                  ...newDocument,
                  uploadDate:
                    newDocument.uploadDate || new Date().toISOString(),
                },
                editingDocument
              );
              if (success) {
                setNewDocument({
                  projectId: "",
                  name: "",
                  type: "projeto",
                  uploadDate: "",
                  fileUrl: "",
                  description: "",
                  version: "",
                  uploadedBy: "",
                });
                setEditingDocument(null);
                setViewMode("documents");
              }
            }}
            onReset={() => {
              setNewDocument({
                projectId: "",
                name: "",
                type: "projeto",
                uploadDate: "",
                fileUrl: "",
                description: "",
                version: "",
                uploadedBy: "",
              });
              setEditingDocument(null);
            }}
            onBack={() => setViewMode("documents")}
          />
        );

      case "quality":
        return (
          <QualityList
            qualityChecklists={qualityChecklists}
            onViewChange={setViewMode}
            onEdit={(checklist) => {
              setEditingQualityChecklist(checklist);
              setNewQualityChecklist({
                projectId: checklist.projectId,
                name: checklist.name,
                description: checklist.description,
                status: checklist.status,
                createdBy: checklist.createdBy || "",
              });
              setViewMode("new-quality");
            }}
            onDelete={qualityHandlers.handleDelete}
          />
        );

      case "new-quality":
        return (
          <QualityForm
            formData={newQualityChecklist}
            projects={projects}
            editingItem={editingQualityChecklist}
            onChange={handleQualityChange}
            onSubmit={async () => {
              if (
                !newQualityChecklist.name ||
                !newQualityChecklist.description
              ) {
                showToastMessage(
                  "Preencha todos os campos obrigatórios",
                  "warning"
                );
                return;
              }
              const success = await qualityHandlers.handleCreate(
                { ...newQualityChecklist, items: [] },
                editingQualityChecklist
              );
              if (success) {
                setNewQualityChecklist({
                  projectId: "",
                  name: "",
                  description: "",
                  status: "pendente",
                  createdBy: "",
                });
                setEditingQualityChecklist(null);
                setViewMode("quality");
              }
            }}
            onReset={() => {
              setNewQualityChecklist({
                projectId: "",
                name: "",
                description: "",
                status: "pendente",
                createdBy: "",
              });
              setEditingQualityChecklist(null);
            }}
            onBack={() => setViewMode("quality")}
          />
        );

      case "reports":
        return (
          <ReportsDashboard
            projects={projects}
            diaryEntries={diaryEntries}
            inventory={inventory}
            budgets={budgets}
            suppliers={suppliers}
            qualityChecklists={qualityChecklists}
            teamMembers={teamMembers}
            equipment={equipment}
            schedules={schedules}
            safetyRecords={safetyRecords}
            measurements={measurements}
            issues={issues}
            documents={documents}
            onViewChange={setViewMode}
          />
        );

      default:
        return (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>View mode não implementado: {viewMode}</h2>
            <Button onClick={() => setViewMode("menu")}>Voltar ao Menu</Button>
          </div>
        );
    }
  };

  return (
    <div className="obras-container">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="obras-header">
        <button onClick={handleBack} className="obras-back-btn">
          ← Voltar
        </button>
        <div className="obras-company-brand">
          <h1 className="obras-company-title">GERENCIAMENTO DE OBRAS</h1>
          <span className="obras-company-subtitle">
            Sistema completo de gestão de construção
          </span>
          <div className="obras-company-underline"></div>
        </div>
        <div className="obras-header-spacer"></div>
      </div>

      {renderContent()}

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
