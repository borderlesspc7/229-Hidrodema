import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Card from "../../../components/ui/Card/Card";
import {
  FiCalendar,
  FiSave,
  FiEdit3,
  FiFile,
  FiTrash2,
  FiPlus,
  FiArrowLeft,
  FiTool,
  FiPackage,
  FiCamera,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiClipboard,
  FiBarChart,
  FiAlertTriangle,
  FiShoppingCart,
  FiTruck,
  FiStar,
  FiTarget,
  FiPieChart,
  FiDownload,
  FiRefreshCw,
  FiSettings,
  FiShield,
  FiAward,
  FiArchive,
  FiUserCheck,
  FiSliders,
} from "react-icons/fi";
import {
  createProject,
  getAllProjects,
  createDiaryEntry,
  getAllDiaryEntries,
  updateDiaryEntry,
  deleteDiaryEntry,
  createInventoryItem,
  getAllInventoryItems,
  createBudget,
  getAllBudgets,
  createSupplier,
  getAllSuppliers,
  createQualityChecklist,
  getAllQualityChecklists,
} from "../../../services/obrasService";
import type {
  Project,
  DiaryEntry,
  InventoryItem,
  Budget,
  Supplier,
  QualityChecklist,
} from "../../../services/obrasService";
import "./GerenciamentoObras.css";

// Interfaces locais (não exportadas pelo serviço)
interface Material {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  price?: number;
  supplier?: string;
  category?: string;
}

interface Photo {
  id: string;
  name: string;
  description: string;
  dataUrl: string;
}

// Novas interfaces para funcionalidades adicionais
interface TeamMember {
  id: string;
  name: string;
  role: string;
  cpf?: string;
  phone?: string;
  workHours?: number;
  hourlyRate?: number;
  attendance?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  code?: string;
  status: "disponivel" | "em-uso" | "manutencao" | "quebrado";
  projectId?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  operator?: string;
  hoursUsed?: number;
  notes?: string;
}

interface Schedule {
  id: string;
  projectId: string;
  taskName: string;
  startDate: string;
  endDate: string;
  progress: number;
  responsible?: string;
  dependencies?: string[];
  status: "nao-iniciado" | "em-andamento" | "concluido" | "atrasado";
  plannedCost?: number;
  actualCost?: number;
}

interface SafetyRecord {
  id: string;
  projectId: string;
  date: string;
  type: "dds" | "inspecao" | "acidente" | "treinamento" | "epi";
  title: string;
  description: string;
  participants?: string[];
  responsible: string;
  severity?: "baixa" | "media" | "alta";
  correctedActions?: string;
  status: "pendente" | "em-andamento" | "concluido";
}

interface Measurement {
  id: string;
  projectId: string;
  date: string;
  period: string;
  description: string;
  plannedPhysicalProgress: number;
  actualPhysicalProgress: number;
  plannedFinancialProgress: number;
  actualFinancialProgress: number;
  observations?: string;
  approved?: boolean;
  approvedBy?: string;
  approvedDate?: string;
}

interface Issue {
  id: string;
  projectId: string;
  date: string;
  title: string;
  description: string;
  category:
    | "tecnico"
    | "financeiro"
    | "prazo"
    | "qualidade"
    | "seguranca"
    | "outro";
  priority: "baixa" | "media" | "alta" | "critica";
  status: "aberto" | "em-analise" | "resolvido" | "cancelado";
  responsible?: string;
  solution?: string;
  solvedDate?: string;
  attachments?: string[];
}

interface Document {
  id: string;
  projectId: string;
  name: string;
  type:
    | "projeto"
    | "art"
    | "contrato"
    | "licenca"
    | "orcamento"
    | "medicao"
    | "outro";
  uploadDate: string;
  fileUrl?: string;
  description?: string;
  version?: string;
  uploadedBy?: string;
}

// BudgetItem interface is defined in obrasService.ts and used via Budget interface

type ViewMode =
  | "menu"
  | "new"
  | "history"
  | "edit"
  | "projects"
  | "inventory"
  | "budgets"
  | "suppliers"
  | "quality"
  | "reports"
  | "new-inventory"
  | "new-budget"
  | "new-supplier"
  | "new-quality"
  | "team"
  | "new-team"
  | "equipment"
  | "new-equipment"
  | "schedule"
  | "new-schedule"
  | "safety"
  | "new-safety"
  | "measurements"
  | "new-measurement"
  | "issues"
  | "new-issue"
  | "documents"
  | "new-document";

export default function GerenciamentoObras() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  // New state for expanded functionality
  const [projects, setProjects] = useState<Project[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [qualityChecklists, setQualityChecklists] = useState<
    QualityChecklist[]
  >([]);

  // Estados para novas funcionalidades
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [safetyRecords, setSafetyRecords] = useState<SafetyRecord[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

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

  // Form states para novas funcionalidades
  const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMember>>({
    name: "",
    role: "",
    cpf: "",
    phone: "",
    workHours: 0,
    hourlyRate: 0,
    attendance: false,
  });

  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: "",
    type: "",
    code: "",
    status: "disponivel",
    projectId: "",
  });

  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
    projectId: "",
    taskName: "",
    startDate: "",
    endDate: "",
    progress: 0,
    status: "nao-iniciado",
  });

  const [newSafetyRecord, setNewSafetyRecord] = useState<Partial<SafetyRecord>>(
    {
      projectId: "",
      date: "",
      type: "dds",
      title: "",
      description: "",
      responsible: "",
      status: "pendente",
    }
  );

  const [newMeasurement, setNewMeasurement] = useState<Partial<Measurement>>({
    projectId: "",
    date: "",
    period: "",
    description: "",
    plannedPhysicalProgress: 0,
    actualPhysicalProgress: 0,
    plannedFinancialProgress: 0,
    actualFinancialProgress: 0,
  });

  const [newIssue, setNewIssue] = useState<Partial<Issue>>({
    projectId: "",
    date: "",
    title: "",
    description: "",
    category: "tecnico",
    priority: "media",
    status: "aberto",
  });

  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    projectId: "",
    name: "",
    type: "projeto",
    uploadDate: "",
    description: "",
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

  // Material form
  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materialUnit, setMaterialUnit] = useState("un");

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          diaries,
          projectsData,
          inventoryData,
          budgetsData,
          suppliersData,
          checklistsData,
        ] = await Promise.all([
          getAllDiaryEntries(),
          getAllProjects(),
          getAllInventoryItems(),
          getAllBudgets(),
          getAllSuppliers(),
          getAllQualityChecklists(),
        ]);

        setDiaryEntries(diaries);
        setProjects(projectsData);
        setInventory(inventoryData);
        setBudgets(budgetsData);
        setSuppliers(suppliersData);
        setQualityChecklists(checklistsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados. Por favor, recarregue a página.");
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    const exists = projects.some((project) => project.id === selectedProjectId);
    if (!exists) {
      setSelectedProjectId("");
    }
  }, [projects, selectedProjectId]);

  // Funções auxiliares para atualizar estado local após operações do Firebase
  const refreshData = async () => {
    try {
      const [
        diaries,
        projectsData,
        inventoryData,
        budgetsData,
        suppliersData,
        checklistsData,
      ] = await Promise.all([
        getAllDiaryEntries(),
        getAllProjects(),
        getAllInventoryItems(),
        getAllBudgets(),
        getAllSuppliers(),
        getAllQualityChecklists(),
      ]);

      setDiaryEntries(diaries);
      setProjects(projectsData);
      setInventory(inventoryData);
      setBudgets(budgetsData);
      setSuppliers(suppliersData);
      setQualityChecklists(checklistsData);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    }
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
      alert("Preencha pelo menos o nome da obra e a data");
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
        alert("Registro atualizado com sucesso!");
      } else {
        await createDiaryEntry(entryData);
        alert("Rascunho salvo com sucesso!");
      }

      await refreshData();
      resetForm();
      setViewMode("history");
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      alert("Erro ao salvar registro. Tente novamente.");
    }
  };

  const handleSubmit = async () => {
    if (!obraName || !date || !activities) {
      alert("Preencha todos os campos obrigatórios");
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
        alert("Registro atualizado com sucesso!");
      } else {
        await createDiaryEntry(entryData);
        alert("Registro salvo com sucesso!");
      }

      await refreshData();
      resetForm();
      setViewMode("history");
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      alert("Erro ao salvar registro. Tente novamente.");
    }
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
    const matchingProject = projects.find((p) => p.name === entry.obraName);
    setSelectedProjectId(matchingProject?.id || "");
    setViewMode("edit");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      try {
        await deleteDiaryEntry(id);
        await refreshData();
        alert("Registro excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir registro:", error);
        alert("Erro ao excluir registro. Tente novamente.");
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
              .materials-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              .materials-table th, .materials-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .materials-table th { background-color: #1e40af; color: white; }
              .photos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 10px; }
              .photo-item { text-align: center; }
              .photo-item img { max-width: 100%; height: auto; border: 1px solid #ddd; }
              .photo-item p { font-size: 12px; margin-top: 5px; }
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
                entry.responsible
              }</span></p>
              <p><span class="label">Clima:</span><span class="value">${
                entry.weather
              }</span></p>
              <p><span class="label">Status:</span><span class="value">${
                entry.status
              }</span></p>
            </div>
            <div class="section">
              <h3>Atividades Realizadas</h3>
              <p>${entry.activities.replace(/\n/g, "<br>")}</p>
            </div>
            <div class="section">
              <h3>Materiais Utilizados</h3>
              <table class="materials-table">
                <thead>
                  <tr><th>Material</th><th>Quantidade</th><th>Unidade</th></tr>
                </thead>
                <tbody>
                  ${entry.materials
                    .map(
                      (m) =>
                        `<tr><td>${m.name}</td><td>${m.quantity}</td><td>${m.unit}</td></tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
            <div class="section">
              <h3>Observações</h3>
              <p>${entry.observations.replace(/\n/g, "<br>")}</p>
            </div>
            <div class="section">
              <h3>Fotos</h3>
              <div class="photos">
                ${entry.photos
                  .map(
                    (p) =>
                      `<div class="photo-item"><img src="${p.dataUrl}" alt="${
                        p.name
                      }"/><p>${p.description || p.name}</p></div>`
                  )
                  .join("")}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleBack = () => {
    if (viewMode === "menu") {
      navigate("/acesso-exclusivo");
    } else {
      resetForm();
      setViewMode("menu");
    }
  };

  // Inventory Management Functions
  const checkInventoryAlerts = () => {
    return inventory.filter((item) => item.quantity <= item.minStock);
  };

  const generateInventoryReport = () => {
    const lowStock = inventory.filter((item) => item.quantity <= item.minStock);
    const totalValue = inventory.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    const categories = [...new Set(inventory.map((item) => item.category))];

    return {
      totalItems: inventory.length,
      lowStockItems: lowStock.length,
      totalValue,
      categories: categories.length,
      alerts: lowStock,
    };
  };

  // Handle new item creation
  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.startDate || !newProject.endDate) {
      alert("Preencha todos os campos obrigatórios da obra");
      return;
    }

    try {
      await createProject({
        name: newProject.name,
        description: newProject.description,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        status: "planejamento",
        budget: newProject.budget,
        spent: 0,
        progress: 0,
        milestones: [],
        team: newProject.team,
        labor: newProject.labor,
        client: newProject.client,
      });

      alert("Obra cadastrada com sucesso!");
      resetNewProjectForm();
      await refreshData();
      setViewMode("projects");
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      alert("Erro ao cadastrar obra. Tente novamente.");
    }
  };

  const handleCreateInventoryItem = async () => {
    if (!newInventoryItem.name || !newInventoryItem.category) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createInventoryItem({
        name: newInventoryItem.name,
        category: newInventoryItem.category,
        quantity: newInventoryItem.quantity,
        unit: newInventoryItem.unit,
        minStock: newInventoryItem.minStock,
        maxStock: newInventoryItem.maxStock,
        price: newInventoryItem.price,
        supplier: newInventoryItem.supplier,
        location: newInventoryItem.location,
      });

      alert("Item adicionado ao estoque com sucesso!");
      resetNewInventoryForm();
      await refreshData();
      setViewMode("inventory");
    } catch (error) {
      console.error("Erro ao criar item de inventário:", error);
      alert("Erro ao adicionar item. Tente novamente.");
    }
  };

  const handleCreateBudget = async () => {
    if (!newBudget.name || !newBudget.totalAmount) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
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
      await refreshData();
      setViewMode("budgets");
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      alert("Erro ao criar orçamento. Tente novamente.");
    }
  };

  const handleCreateSupplier = async () => {
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.email) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createSupplier({
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
      await refreshData();
      setViewMode("suppliers");
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error);
      alert("Erro ao cadastrar fornecedor. Tente novamente.");
    }
  };

  const handleCreateQualityChecklist = async () => {
    if (!newQualityChecklist.name || !newQualityChecklist.projectId) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
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
      await refreshData();
      setViewMode("quality");
    } catch (error) {
      console.error("Erro ao criar checklist:", error);
      alert("Erro ao criar checklist. Tente novamente.");
    }
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

  // Render Menu
  const renderMenu = () => (
    <div className="obras-menu-container">
      <div className="obras-menu-cards">
        <Card
          variant="service"
          title="CRIAR OBRA"
          textColor="#1e40af"
          backgroundColor="#f0f9ff"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("projects")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiTool size={48} />
            </div>
            <p>Cadastrar novas obras para gerenciamento</p>
            <span className="obras-entry-count">{projects.length} obras</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="NOVO REGISTRO"
          textColor="#1e40af"
          backgroundColor="#f0f9ff"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("new")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiPlus size={48} />
            </div>
            <p>Criar novo registro diário de obra</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="HISTÓRICO"
          textColor="#059669"
          backgroundColor="#f0fdf4"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("history")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiFileText size={48} />
            </div>
            <p>Consultar registros anteriores</p>
            <span className="obras-entry-count">
              {diaryEntries.length} registros
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="ESTOQUE"
          textColor="#dc2626"
          backgroundColor="#fef2f2"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("inventory")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiPackage size={48} />
            </div>
            <p>Controle de estoque de materiais</p>
            <span className="obras-entry-count">{inventory.length} itens</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="ORÇAMENTOS"
          textColor="#ea580c"
          backgroundColor="#fff7ed"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("budgets")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiDollarSign size={48} />
            </div>
            <p>Sistema de orçamentos automatizado</p>
            <span className="obras-entry-count">
              {budgets.length} orçamentos
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="FORNECEDORES"
          textColor="#0891b2"
          backgroundColor="#f0f9ff"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("suppliers")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiTruck size={48} />
            </div>
            <p>Gestão de fornecedores</p>
            <span className="obras-entry-count">
              {suppliers.length} fornecedores
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="QUALIDADE"
          textColor="#16a34a"
          backgroundColor="#f0fdf4"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("quality")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiClipboard size={48} />
            </div>
            <p>Controle de qualidade com checklists</p>
            <span className="obras-entry-count">
              {qualityChecklists.length} checklists
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="RELATÓRIOS"
          textColor="#9333ea"
          backgroundColor="#faf5ff"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("reports")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiBarChart size={48} />
            </div>
            <p>Relatórios e análises</p>
            <span className="obras-entry-count">Dashboard completo</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="EQUIPE"
          textColor="#7c3aed"
          backgroundColor="#faf5ff"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("team")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiUserCheck size={48} />
            </div>
            <p>Gestão de equipe e mão de obra</p>
            <span className="obras-entry-count">
              {teamMembers.length} membros
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="EQUIPAMENTOS"
          textColor="#ea580c"
          backgroundColor="#fff7ed"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("equipment")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiSettings size={48} />
            </div>
            <p>Controle de equipamentos</p>
            <span className="obras-entry-count">
              {equipment.length} equipamentos
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="CRONOGRAMA"
          textColor="#0891b2"
          backgroundColor="#ecfeff"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("schedule")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiSliders size={48} />
            </div>
            <p>Planejamento e cronograma</p>
            <span className="obras-entry-count">
              {schedules.length} tarefas
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="SEGURANÇA"
          textColor="#dc2626"
          backgroundColor="#fef2f2"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("safety")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiShield size={48} />
            </div>
            <p>Segurança do trabalho</p>
            <span className="obras-entry-count">
              {safetyRecords.length} registros
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="MEDIÇÕES"
          textColor="#16a34a"
          backgroundColor="#f0fdf4"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("measurements")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiAward size={48} />
            </div>
            <p>Avanço físico-financeiro</p>
            <span className="obras-entry-count">
              {measurements.length} medições
            </span>
          </div>
        </Card>

        <Card
          variant="service"
          title="PROBLEMAS"
          textColor="#f59e0b"
          backgroundColor="#fffbeb"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("issues")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiAlertTriangle size={48} />
            </div>
            <p>Não conformidades e problemas</p>
            <span className="obras-entry-count">{issues.length} registros</span>
          </div>
        </Card>

        <Card
          variant="service"
          title="DOCUMENTOS"
          textColor="#1e40af"
          backgroundColor="#eff6ff"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("documents")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiArchive size={48} />
            </div>
            <p>Documentação técnica</p>
            <span className="obras-entry-count">
              {documents.length} documentos
            </span>
          </div>
        </Card>
      </div>
    </div>
  );

  // Render Form
  const renderForm = () => (
    <div className="obras-form-container">
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">
            {editingEntry ? "EDITAR REGISTRO" : "DIÁRIO DE OBRA"}
          </h2>
          <p className="obras-form-subtitle">
            Registro diário de atividades em campo
          </p>
        </div>

        <div className="obras-form-content">
          {/* Informações Básicas */}
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiFileText /> Informações da Obra
            </h3>
            {projects.length > 0 && (
              <div className="obras-form-field obras-field-full">
                <label>Selecionar Obra Cadastrada</label>
                <select
                  className="obras-select"
                  value={selectedProjectId}
                  onChange={(e) => handleSelectProjectForEntry(e.target.value)}
                >
                  <option value="">Informar manualmente</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id || ""}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <span className="obras-helper-text">
                  Ao selecionar, o nome da obra é preenchido automaticamente.
                </span>
              </div>
            )}
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome da Obra *</label>
                <Input
                  type="text"
                  placeholder="Nome do projeto ou obra"
                  value={obraName}
                  onChange={setObraName}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Data *</label>
                <Input
                  type="date"
                  placeholder=""
                  value={date}
                  onChange={setDate}
                  required
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Responsável</label>
                <Input
                  type="text"
                  placeholder="Nome do responsável"
                  value={responsible}
                  onChange={setResponsible}
                />
              </div>
              <div className="obras-form-field">
                <label>Clima</label>
                <select
                  className="obras-select"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Ensolarado">☀️ Ensolarado</option>
                  <option value="Nublado">☁️ Nublado</option>
                  <option value="Chuvoso">🌧️ Chuvoso</option>
                  <option value="Ventoso">💨 Ventoso</option>
                </select>
              </div>
              <div className="obras-form-field">
                <label>Status</label>
                <select
                  className="obras-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as DiaryEntry["status"])
                  }
                >
                  <option value="em-andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="pausada">Pausada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Atividades */}
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiTool /> Atividades Realizadas *
            </h3>
            <textarea
              className="obras-textarea"
              placeholder="Descreva as atividades realizadas no dia..."
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* Materiais */}
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiPackage /> Materiais Utilizados
            </h3>
            <div className="obras-materials-form">
              <div className="obras-form-row">
                <div className="obras-form-field">
                  <label className="obras-field-label">Nome do Material</label>
                  <input
                    type="text"
                    className="obras-select"
                    placeholder="Ex: Cimento, Areia, Tijolo"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                  />
                </div>
                <div className="obras-form-field obras-field-small">
                  <label className="obras-field-label">Quantidade</label>
                  <input
                    type="text"
                    className="obras-select"
                    placeholder="Qtd"
                    value={materialQuantity}
                    onChange={(e) => setMaterialQuantity(e.target.value)}
                  />
                </div>
                <div className="obras-form-field obras-field-small">
                  <label className="obras-field-label">Unidade</label>
                  <select
                    className="obras-select"
                    value={materialUnit}
                    onChange={(e) => setMaterialUnit(e.target.value)}
                  >
                    <option value="un">un</option>
                    <option value="m">m</option>
                    <option value="m²">m²</option>
                    <option value="m³">m³</option>
                    <option value="kg">kg</option>
                    <option value="l">l</option>
                    <option value="sc">sc</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddMaterial}
                  className="obras-add-material-btn"
                >
                  <FiPlus size={16} />
                  Adicionar
                </Button>
              </div>
            </div>

            {materials.length > 0 && (
              <div className="obras-materials-list">
                <table className="obras-materials-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Quantidade</th>
                      <th>Unidade</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material) => (
                      <tr key={material.id}>
                        <td>{material.name}</td>
                        <td>{material.quantity}</td>
                        <td>{material.unit}</td>
                        <td>
                          <Button
                            variant="secondary"
                            onClick={() => handleRemoveMaterial(material.id)}
                            className="obras-remove-btn"
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fotos */}
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiCamera /> Fotos
            </h3>
            <div className="obras-photo-upload">
              <label className="obras-upload-label">
                <FiCamera size={24} />
                <span>Adicionar Fotos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {photos.length > 0 && (
              <div className="obras-photos-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="obras-photo-item">
                    <img src={photo.dataUrl} alt={photo.name} />
                    <input
                      type="text"
                      placeholder="Descrição da foto"
                      value={photo.description}
                      onChange={(e) =>
                        handleUpdatePhotoDescription(photo.id, e.target.value)
                      }
                      className="obras-photo-description"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="obras-remove-photo-btn"
                    >
                      <FiTrash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiFileText /> Observações
            </h3>
            <textarea
              className="obras-textarea"
              placeholder="Observações gerais, problemas encontrados, pendências..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
            />
          </div>

          {/* Botões de Ação */}
          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              className="obras-action-btn"
            >
              <FiSave size={16} />
              Salvar Rascunho
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              {editingEntry ? "Atualizar" : "Salvar Registro"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render History
  const renderHistory = () => (
    <div className="obras-history-container">
      <div className="obras-history-header">
        <h2>Histórico de Registros</h2>
        <Button
          variant="secondary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-entries-list">
        {diaryEntries.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiFileText size={64} />
            </div>
            <h3>Nenhum registro encontrado</h3>
            <p>Crie seu primeiro registro diário de obra</p>
            <Button variant="primary" onClick={() => setViewMode("new")}>
              Novo Registro
            </Button>
          </div>
        ) : (
          diaryEntries.map((entry) => (
            <div key={entry.id} className="obras-entry-item">
              <div className="obras-entry-info">
                <h3>{entry.obraName}</h3>
                <div className="obras-entry-meta">
                  <span className="obras-date">
                    <FiCalendar size={16} />
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <span className={`obras-status obras-status-${entry.status}`}>
                    {entry.status === "em-andamento" && (
                      <>
                        <FiClock size={16} />
                        Em Andamento
                      </>
                    )}
                    {entry.status === "concluida" && (
                      <>
                        <FiCheckCircle size={16} />
                        Concluída
                      </>
                    )}
                    {entry.status === "pausada" && (
                      <>
                        <FiClock size={16} />
                        Pausada
                      </>
                    )}
                  </span>
                  <span className="obras-materials-count">
                    <FiPackage size={16} />
                    {entry.materials.length} materiais
                  </span>
                  <span className="obras-photos-count">
                    <FiCamera size={16} />
                    {entry.photos.length} fotos
                  </span>
                </div>
              </div>
              <div className="obras-entry-actions">
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(entry)}
                  className="obras-action-button"
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleExportPDF(entry)}
                  className="obras-action-button"
                >
                  <FiFile size={16} />
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => entry.id && handleDelete(entry.id)}
                  className="obras-action-button obras-delete"
                >
                  <FiTrash2 size={16} />
                  Excluir
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Projects (Criar Obra)
  const renderProjects = () => (
    <div className="obras-projects-container">
      <div className="obras-projects-header">
        <h2>Criar Obra</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-projects-form-section">
        <Card
          variant="service"
          className="obras-form-card"
          title=""
          textColor="#1e293b"
        >
          <div className="obras-form-header">
            <h2 className="obras-form-title">Cadastrar Nova Obra</h2>
            <p className="obras-form-subtitle">
              Registre uma obra para utilizá-la em relatórios e acompanhamentos
            </p>
          </div>

          <div className="obras-form-content">
            <div className="obras-section">
              <h3 className="obras-section-title">
                <FiTool /> Informações da Obra
              </h3>
              <div className="obras-form-row">
                <div className="obras-form-field">
                  <label>Nome da Obra *</label>
                  <Input
                    type="text"
                    placeholder="Nome da obra"
                    value={newProject.name}
                    onChange={(value) =>
                      setNewProject({ ...newProject, name: value })
                    }
                    required
                  />
                </div>
                <div className="obras-form-field">
                  <label>Cliente *</label>
                  <Input
                    type="text"
                    placeholder="Nome do cliente"
                    value={newProject.client}
                    onChange={(value) =>
                      setNewProject({ ...newProject, client: value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="obras-form-row">
                <div className="obras-form-field">
                  <label>Data de Início *</label>
                  <Input
                    type="date"
                    placeholder="Data de início"
                    value={newProject.startDate}
                    onChange={(value) =>
                      setNewProject({ ...newProject, startDate: value })
                    }
                    required
                  />
                </div>
                <div className="obras-form-field">
                  <label>Data de Término *</label>
                  <Input
                    type="date"
                    placeholder="Data de término"
                    value={newProject.endDate}
                    onChange={(value) =>
                      setNewProject({ ...newProject, endDate: value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="obras-form-row">
                <div className="obras-form-field">
                  <label>Orçamento (R$)</label>
                  <Input
                    type="text"
                    placeholder="Valor do orçamento"
                    value={(newProject.budget * 100).toString()}
                    onChange={(value) =>
                      setNewProject({
                        ...newProject,
                        budget: (parseFloat(value) || 0) / 100,
                      })
                    }
                    mask="currency"
                    min={0}
                  />
                </div>
                <div className="obras-form-field">
                  <label>Mão de Obra</label>
                  <Input
                    type="text"
                    placeholder="Equipe, empresa ou observações"
                    value={newProject.labor}
                    onChange={(value) =>
                      setNewProject({ ...newProject, labor: value })
                    }
                  />
                </div>
              </div>

              <div className="obras-form-field">
                <label>Descrição</label>
                <textarea
                  className="obras-textarea"
                  placeholder="Descrição do projeto..."
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
            </div>

            <div className="obras-form-actions">
              <Button
                variant="secondary"
                onClick={() => resetNewProjectForm()}
                className="obras-action-btn"
              >
                <FiRefreshCw size={16} />
                Limpar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateProject}
                className="obras-action-btn obras-submit-btn"
              >
                <FiCheckCircle size={16} />
                Salvar Obra
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="obras-projects-list-section">
        <h3 className="obras-projects-list-title">Obras cadastradas</h3>
        <div className="obras-projects-grid">
          {projects.length === 0 ? (
            <div className="obras-empty-state">
              <div className="obras-empty-icon">
                <FiTrendingUp size={64} />
              </div>
              <h3>Nenhuma obra cadastrada</h3>
              <p>Utilize o formulário acima para registrar sua primeira obra</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id || `project-${project.name}`}
                className="obras-project-card"
              >
                <div className="obras-project-header">
                  <h3>{project.name}</h3>
                  <span
                    className={`obras-project-status obras-status-${project.status}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="obras-project-info">
                  <p>
                    <strong>Cliente:</strong> {project.client}
                  </p>
                  <p>
                    <strong>Mão de Obra:</strong>{" "}
                    {project.labor || "Não informado"}
                  </p>
                  <p>
                    <strong>Orçamento:</strong> R${" "}
                    {project.budget.toLocaleString()}
                  </p>
                  <p>
                    <strong>Gasto:</strong> R$ {project.spent.toLocaleString()}
                  </p>
                  <p>
                    <strong>Progresso:</strong> {project.progress}%
                  </p>
                </div>
                <div className="obras-project-progress">
                  <div className="obras-progress-bar">
                    <div
                      className="obras-progress-fill"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="obras-project-actions">
                  <Button variant="secondary">
                    <FiEdit3 size={16} />
                    Editar
                  </Button>
                  <Button variant="primary">
                    <FiBarChart size={16} />
                    Relatório
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Render Inventory (Estoque)
  const renderInventory = () => {
    const alerts = checkInventoryAlerts();

    return (
      <div className="obras-inventory-container">
        <div className="obras-inventory-header">
          <h2>Controle de Estoque</h2>
          {alerts.length > 0 && (
            <div className="obras-alert-banner">
              <FiAlertTriangle size={20} />
              <span>{alerts.length} itens com estoque baixo</span>
            </div>
          )}
          <Button
            variant="primary"
            onClick={() => setViewMode("menu")}
            className="obras-back-to-menu"
          >
            <FiArrowLeft size={16} />
            Voltar ao Menu
          </Button>
        </div>

        <div className="obras-inventory-actions">
          <Button
            variant="primary"
            onClick={() => setViewMode("new-inventory")}
            className="obras-create-btn"
          >
            <FiPlus size={20} />
            Novo Item
          </Button>
        </div>

        <div className="obras-inventory-grid">
          {inventory.length === 0 ? (
            <div className="obras-empty-state">
              <div className="obras-empty-icon">
                <FiPackage size={64} />
              </div>
              <h3>Estoque vazio</h3>
              <p>Adicione itens ao seu estoque</p>
              <Button
                variant="primary"
                onClick={() => setViewMode("new-inventory")}
              >
                Adicionar Primeiro Item
              </Button>
            </div>
          ) : (
            inventory.map((item) => (
              <div key={item.id} className="obras-inventory-item">
                <div className="obras-item-header">
                  <h3>{item.name}</h3>
                  <span
                    className={`obras-item-status ${
                      item.quantity <= item.minStock ? "low-stock" : "normal"
                    }`}
                  >
                    {item.quantity <= item.minStock
                      ? "Estoque Baixo"
                      : "Normal"}
                  </span>
                </div>
                <div className="obras-item-info">
                  <p>
                    <strong>Categoria:</strong> {item.category}
                  </p>
                  <p>
                    <strong>Quantidade:</strong> {item.quantity} {item.unit}
                  </p>
                  <p>
                    <strong>Preço:</strong> R$ {item.price.toFixed(2)}
                  </p>
                  <p>
                    <strong>Fornecedor:</strong> {item.supplier}
                  </p>
                  <p>
                    <strong>Localização:</strong> {item.location}
                  </p>
                </div>
                <div className="obras-item-actions">
                  <Button variant="secondary">
                    <FiEdit3 size={16} />
                    Editar
                  </Button>
                  <Button variant="primary">
                    <FiShoppingCart size={16} />
                    Comprar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Render Budgets (Orçamentos)
  const renderBudgets = () => (
    <div className="obras-budgets-container">
      <div className="obras-budgets-header">
        <h2>Sistema de Orçamentos</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-budgets-actions">
        <Button
          variant="primary"
          onClick={() => setViewMode("new-budget")}
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          Novo Orçamento
        </Button>
      </div>

      <div className="obras-budgets-grid">
        {budgets.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiDollarSign size={64} />
            </div>
            <h3>Nenhum orçamento encontrado</h3>
            <p>Crie seu primeiro orçamento</p>
            <Button variant="primary" onClick={() => setViewMode("new-budget")}>
              Criar Primeiro Orçamento
            </Button>
          </div>
        ) : (
          budgets.map((budget) => (
            <div key={budget.id} className="obras-budget-card">
              <div className="obras-budget-header">
                <h3>{budget.name}</h3>
                <span className="obras-budget-status">
                  {((budget.spentAmount / budget.totalAmount) * 100).toFixed(1)}
                  % gasto
                </span>
              </div>
              <div className="obras-budget-info">
                <p>
                  <strong>Total:</strong> R${" "}
                  {budget.totalAmount.toLocaleString()}
                </p>
                <p>
                  <strong>Gasto:</strong> R${" "}
                  {budget.spentAmount.toLocaleString()}
                </p>
                <p>
                  <strong>Restante:</strong> R${" "}
                  {(budget.totalAmount - budget.spentAmount).toLocaleString()}
                </p>
              </div>
              <div className="obras-budget-progress">
                <div className="obras-progress-bar">
                  <div
                    className="obras-progress-fill"
                    style={{
                      width: `${
                        (budget.spentAmount / budget.totalAmount) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="obras-budget-actions">
                <Button variant="secondary">
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button variant="primary">
                  <FiPieChart size={16} />
                  Detalhes
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Suppliers (Fornecedores)
  const renderSuppliers = () => (
    <div className="obras-suppliers-container">
      <div className="obras-suppliers-header">
        <h2>Gestão de Fornecedores</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-suppliers-actions">
        <Button
          variant="primary"
          onClick={() => setViewMode("new-supplier")}
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          Novo Fornecedor
        </Button>
      </div>

      <div className="obras-suppliers-grid">
        {suppliers.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiTruck size={64} />
            </div>
            <h3>Nenhum fornecedor cadastrado</h3>
            <p>Cadastre seus fornecedores</p>
            <Button
              variant="primary"
              onClick={() => setViewMode("new-supplier")}
            >
              Cadastrar Primeiro Fornecedor
            </Button>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <div key={supplier.id} className="obras-supplier-card">
              <div className="obras-supplier-header">
                <h3>{supplier.name}</h3>
                <div className="obras-supplier-rating">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={16}
                      color={i < supplier.rating ? "#fbbf24" : "#d1d5db"}
                    />
                  ))}
                </div>
              </div>
              <div className="obras-supplier-info">
                <p>
                  <strong>Contato:</strong> {supplier.contact}
                </p>
                <p>
                  <strong>Email:</strong> {supplier.email}
                </p>
                <p>
                  <strong>Telefone:</strong> {supplier.phone}
                </p>
                <p>
                  <strong>Categoria:</strong> {supplier.category}
                </p>
                <p>
                  <strong>Confiabilidade:</strong> {supplier.reliability}
                </p>
                <p>
                  <strong>Prazo de Entrega:</strong> {supplier.deliveryTime}{" "}
                  dias
                </p>
              </div>
              <div className="obras-supplier-actions">
                <Button variant="secondary">
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button variant="primary">
                  <FiUsers size={16} />
                  Contatar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Quality (Qualidade)
  const renderQuality = () => (
    <div className="obras-quality-container">
      <div className="obras-quality-header">
        <h2>Controle de Qualidade</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-quality-actions">
        <Button
          variant="primary"
          onClick={() => setViewMode("new-quality")}
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          Novo Checklist
        </Button>
      </div>

      <div className="obras-quality-grid">
        {qualityChecklists.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiClipboard size={64} />
            </div>
            <h3>Nenhum checklist encontrado</h3>
            <p>Crie checklists de qualidade</p>
            <Button
              variant="primary"
              onClick={() => setViewMode("new-quality")}
            >
              Criar Primeiro Checklist
            </Button>
          </div>
        ) : (
          qualityChecklists.map((checklist) => (
            <div key={checklist.id} className="obras-quality-card">
              <div className="obras-quality-header">
                <h3>{checklist.name}</h3>
                <span
                  className={`obras-quality-status obras-status-${checklist.status}`}
                >
                  {checklist.status}
                </span>
              </div>
              <div className="obras-quality-info">
                <p>{checklist.description}</p>
                <p>
                  <strong>Itens:</strong> {checklist.items.length}
                </p>
                <p>
                  <strong>Concluídos:</strong>{" "}
                  {
                    checklist.items.filter((i) => i.status === "aprovado")
                      .length
                  }
                </p>
              </div>
              <div className="obras-quality-actions">
                <Button variant="secondary">
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button variant="primary">
                  <FiTarget size={16} />
                  Executar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render New Inventory Form
  const renderNewInventoryForm = () => (
    <div className="obras-form-container">
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">NOVO ITEM DE ESTOQUE</h2>
          <p className="obras-form-subtitle">
            Adicionar item ao controle de estoque
          </p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiPackage /> Informações do Item
            </h3>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome do Item *</label>
                <Input
                  type="text"
                  placeholder="Nome do material"
                  value={newInventoryItem.name}
                  onChange={(value) =>
                    setNewInventoryItem({ ...newInventoryItem, name: value })
                  }
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Categoria *</label>
                <Input
                  type="text"
                  placeholder="Categoria do material"
                  value={newInventoryItem.category}
                  onChange={(value) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      category: value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Quantidade Atual</label>
                <Input
                  type="text"
                  placeholder="Quantidade"
                  value={newInventoryItem.quantity.toString()}
                  onChange={(value) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      quantity: parseInt(value) || 0,
                    })
                  }
                  mask="number"
                  min={0}
                />
              </div>
              <div className="obras-form-field">
                <label>Unidade</label>
                <select
                  className="obras-select"
                  value={newInventoryItem.unit}
                  onChange={(e) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      unit: e.target.value,
                    })
                  }
                >
                  <option value="un">un</option>
                  <option value="kg">kg</option>
                  <option value="m">m</option>
                  <option value="m²">m²</option>
                  <option value="m³">m³</option>
                  <option value="l">l</option>
                  <option value="saco">saco</option>
                </select>
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Estoque Mínimo</label>
                <Input
                  type="text"
                  placeholder="Estoque mínimo"
                  value={newInventoryItem.minStock.toString()}
                  onChange={(value) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      minStock: parseInt(value) || 0,
                    })
                  }
                  mask="number"
                  min={0}
                />
              </div>
              <div className="obras-form-field">
                <label>Estoque Máximo</label>
                <Input
                  type="text"
                  placeholder="Estoque máximo"
                  value={newInventoryItem.maxStock.toString()}
                  onChange={(value) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      maxStock: parseInt(value) || 0,
                    })
                  }
                  mask="number"
                  min={0}
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Preço Unitário (R$)</label>
                <Input
                  type="text"
                  placeholder="Preço por unidade"
                  value={(newInventoryItem.price * 100).toString()}
                  onChange={(value) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      price: (parseFloat(value) || 0) / 100,
                    })
                  }
                  mask="currency"
                  min={0}
                />
              </div>
              <div className="obras-form-field">
                <label>Fornecedor</label>
                <Input
                  type="text"
                  placeholder="Nome do fornecedor"
                  value={newInventoryItem.supplier}
                  onChange={(value) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      supplier: value,
                    })
                  }
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>Localização</label>
              <Input
                type="text"
                placeholder="Local onde está armazenado"
                value={newInventoryItem.location}
                onChange={(value) =>
                  setNewInventoryItem({ ...newInventoryItem, location: value })
                }
              />
            </div>
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => setViewMode("inventory")}
              className="obras-action-btn"
            >
              <FiArrowLeft size={16} />
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateInventoryItem}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              Adicionar Item
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render New Budget Form
  const renderNewBudgetForm = () => (
    <div className="obras-form-container">
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">NOVO ORÇAMENTO</h2>
          <p className="obras-form-subtitle">
            Criar novo orçamento para projeto
          </p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiDollarSign /> Informações do Orçamento
            </h3>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome do Orçamento *</label>
                <Input
                  type="text"
                  placeholder="Nome do orçamento"
                  value={newBudget.name}
                  onChange={(value) =>
                    setNewBudget({ ...newBudget, name: value })
                  }
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Projeto Relacionado</label>
                <select
                  className="obras-select"
                  value={newBudget.projectId}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, projectId: e.target.value })
                  }
                >
                  <option value="">Selecione um projeto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id || ""}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Valor Total (R$) *</label>
                <Input
                  type="text"
                  placeholder="Valor total do orçamento"
                  value={(newBudget.totalAmount * 100).toString()}
                  onChange={(value) =>
                    setNewBudget({
                      ...newBudget,
                      totalAmount: (parseFloat(value) || 0) / 100,
                    })
                  }
                  mask="currency"
                  min={0}
                  required
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>Descrição</label>
              <textarea
                className="obras-textarea"
                placeholder="Descrição do orçamento..."
                value={newBudget.description}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, description: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => setViewMode("budgets")}
              className="obras-action-btn"
            >
              <FiArrowLeft size={16} />
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateBudget}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              Criar Orçamento
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render New Supplier Form
  const renderNewSupplierForm = () => (
    <div className="obras-form-container">
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">NOVO FORNECEDOR</h2>
          <p className="obras-form-subtitle">Cadastrar novo fornecedor</p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiTruck /> Informações do Fornecedor
            </h3>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome da Empresa *</label>
                <Input
                  type="text"
                  placeholder="Nome da empresa"
                  value={newSupplier.name}
                  onChange={(value) =>
                    setNewSupplier({ ...newSupplier, name: value })
                  }
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Contato *</label>
                <Input
                  type="text"
                  placeholder="Nome do contato"
                  value={newSupplier.contact}
                  onChange={(value) =>
                    setNewSupplier({ ...newSupplier, contact: value })
                  }
                  required
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Email *</label>
                <Input
                  type="email"
                  placeholder="email@empresa.com"
                  value={newSupplier.email}
                  onChange={(value) =>
                    setNewSupplier({ ...newSupplier, email: value })
                  }
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Telefone</label>
                <Input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={newSupplier.phone}
                  onChange={(value) =>
                    setNewSupplier({ ...newSupplier, phone: value })
                  }
                  mask="phone"
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Categoria</label>
                <Input
                  type="text"
                  placeholder="Tipo de materiais"
                  value={newSupplier.category}
                  onChange={(value) =>
                    setNewSupplier({ ...newSupplier, category: value })
                  }
                />
              </div>
              <div className="obras-form-field">
                <label>Confiabilidade</label>
                <select
                  className="obras-select"
                  value={newSupplier.reliability}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      reliability: e.target.value as
                        | "excelente"
                        | "bom"
                        | "regular"
                        | "ruim",
                    })
                  }
                >
                  <option value="excelente">Excelente</option>
                  <option value="bom">Bom</option>
                  <option value="regular">Regular</option>
                  <option value="ruim">Ruim</option>
                </select>
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Prazo de Entrega (dias)</label>
                <Input
                  type="text"
                  placeholder="Dias para entrega"
                  value={newSupplier.deliveryTime.toString()}
                  onChange={(value) =>
                    setNewSupplier({
                      ...newSupplier,
                      deliveryTime: parseInt(value) || 0,
                    })
                  }
                  mask="number"
                  min={0}
                />
              </div>
              <div className="obras-form-field">
                <label>Termos de Pagamento</label>
                <Input
                  type="text"
                  placeholder="Ex: 30 dias"
                  value={newSupplier.paymentTerms}
                  onChange={(value) =>
                    setNewSupplier({ ...newSupplier, paymentTerms: value })
                  }
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>Endereço</label>
              <Input
                type="text"
                placeholder="Endereço completo"
                value={newSupplier.address}
                onChange={(value) =>
                  setNewSupplier({ ...newSupplier, address: value })
                }
              />
            </div>
            <div className="obras-form-field">
              <label>Observações</label>
              <textarea
                className="obras-textarea"
                placeholder="Observações sobre o fornecedor..."
                value={newSupplier.notes}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => setViewMode("suppliers")}
              className="obras-action-btn"
            >
              <FiArrowLeft size={16} />
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSupplier}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              Cadastrar Fornecedor
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render New Quality Form
  const renderNewQualityForm = () => (
    <div className="obras-form-container">
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">NOVO CHECKLIST DE QUALIDADE</h2>
          <p className="obras-form-subtitle">
            Criar checklist de controle de qualidade
          </p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiClipboard /> Informações do Checklist
            </h3>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome do Checklist *</label>
                <Input
                  type="text"
                  placeholder="Nome do checklist"
                  value={newQualityChecklist.name}
                  onChange={(value) =>
                    setNewQualityChecklist({
                      ...newQualityChecklist,
                      name: value,
                    })
                  }
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Projeto Relacionado *</label>
                <select
                  className="obras-select"
                  value={newQualityChecklist.projectId}
                  onChange={(e) =>
                    setNewQualityChecklist({
                      ...newQualityChecklist,
                      projectId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Selecione um projeto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id || ""}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="obras-form-field">
              <label>Descrição</label>
              <textarea
                className="obras-textarea"
                placeholder="Descrição do checklist..."
                value={newQualityChecklist.description}
                onChange={(e) =>
                  setNewQualityChecklist({
                    ...newQualityChecklist,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>

          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiTarget /> Itens do Checklist
            </h3>
            {newQualityChecklist.items.map((item, index) => (
              <div key={index} className="obras-quality-item-form">
                <div className="obras-form-row">
                  <div className="obras-form-field">
                    <label>Descrição do Item</label>
                    <Input
                      type="text"
                      placeholder="Descrição do item a ser verificado"
                      value={item.description}
                      onChange={(value) => {
                        const newItems = [...newQualityChecklist.items];
                        newItems[index] = { ...item, description: value };
                        setNewQualityChecklist({
                          ...newQualityChecklist,
                          items: newItems,
                        });
                      }}
                    />
                  </div>
                  <div className="obras-form-field">
                    <label>Responsável</label>
                    <Input
                      type="text"
                      placeholder="Nome do responsável"
                      value={item.responsible}
                      onChange={(value) => {
                        const newItems = [...newQualityChecklist.items];
                        newItems[index] = { ...item, responsible: value };
                        setNewQualityChecklist({
                          ...newQualityChecklist,
                          items: newItems,
                        });
                      }}
                    />
                  </div>
                  <div className="obras-form-field obras-field-small">
                    <Button
                      variant="secondary"
                      onClick={() => removeQualityItem(index)}
                      className="obras-remove-btn"
                    >
                      <FiTrash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={addQualityItem}
              className="obras-add-item-btn"
            >
              <FiPlus size={16} />
              Adicionar Item
            </Button>
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => setViewMode("quality")}
              className="obras-action-btn"
            >
              <FiArrowLeft size={16} />
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateQualityChecklist}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              Criar Checklist
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render Reports (Relatórios)
  const renderReports = () => {
    const inventoryReport = generateInventoryReport();

    return (
      <div className="obras-reports-container">
        <div className="obras-reports-header">
          <h2>Relatórios e Análises</h2>
          <Button
            variant="primary"
            onClick={() => setViewMode("menu")}
            className="obras-back-to-menu"
          >
            <FiArrowLeft size={16} />
            Voltar ao Menu
          </Button>
        </div>

        <div className="obras-reports-dashboard">
          <div className="obras-dashboard-cards">
            <div className="obras-dashboard-card">
              <div className="obras-card-icon">
                <FiFileText size={32} />
              </div>
              <div className="obras-card-content">
                <h3>Registros Diários</h3>
                <p className="obras-card-number">{diaryEntries.length}</p>
                <p className="obras-card-label">Total de registros</p>
              </div>
            </div>

            <div className="obras-dashboard-card">
              <div className="obras-card-icon">
                <FiTrendingUp size={32} />
              </div>
              <div className="obras-card-content">
                <h3>Projetos Ativos</h3>
                <p className="obras-card-number">{projects.length}</p>
                <p className="obras-card-label">Projetos em andamento</p>
              </div>
            </div>

            <div className="obras-dashboard-card">
              <div className="obras-card-icon">
                <FiPackage size={32} />
              </div>
              <div className="obras-card-content">
                <h3>Itens em Estoque</h3>
                <p className="obras-card-number">
                  {inventoryReport.totalItems}
                </p>
                <p className="obras-card-label">Total de itens</p>
              </div>
            </div>

            <div className="obras-dashboard-card">
              <div className="obras-card-icon">
                <FiAlertTriangle size={32} />
              </div>
              <div className="obras-card-content">
                <h3>Alertas de Estoque</h3>
                <p className="obras-card-number">
                  {inventoryReport.lowStockItems}
                </p>
                <p className="obras-card-label">Itens com estoque baixo</p>
              </div>
            </div>

            <div className="obras-dashboard-card">
              <div className="obras-card-icon">
                <FiDollarSign size={32} />
              </div>
              <div className="obras-card-content">
                <h3>Valor do Estoque</h3>
                <p className="obras-card-number">
                  R$ {inventoryReport.totalValue.toLocaleString()}
                </p>
                <p className="obras-card-label">Valor total</p>
              </div>
            </div>

            <div className="obras-dashboard-card">
              <div className="obras-card-icon">
                <FiTruck size={32} />
              </div>
              <div className="obras-card-content">
                <h3>Fornecedores</h3>
                <p className="obras-card-number">{suppliers.length}</p>
                <p className="obras-card-label">Fornecedores cadastrados</p>
              </div>
            </div>
          </div>

          <div className="obras-reports-actions">
            <Button variant="primary">
              <FiDownload size={20} />
              Exportar Relatório Completo
            </Button>
            <Button variant="secondary">
              <FiRefreshCw size={20} />
              Atualizar Dados
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== NOVAS FUNÇÕES DE RENDERIZAÇÃO ====================

  // Render Team Management
  const renderTeam = () => (
    <div className="obras-section-container">
      <div className="obras-section-header">
        <h2 className="obras-section-title">
          <FiUserCheck /> GESTÃO DE EQUIPE
        </h2>
        <Button variant="primary" onClick={() => setViewMode("new-team")}>
          <FiPlus /> Novo Membro
        </Button>
      </div>

      <div className="obras-grid">
        {teamMembers.length === 0 ? (
          <div className="obras-empty-state">
            <FiUsers size={64} />
            <p>Nenhum membro cadastrado</p>
            <Button variant="primary" onClick={() => setViewMode("new-team")}>
              Cadastrar Primeiro Membro
            </Button>
          </div>
        ) : (
          teamMembers.map((member) => (
            <div key={member.id} className="obras-item-card">
              <h3>{member.name}</h3>
              <p>
                <strong>Função:</strong> {member.role}
              </p>
              {member.phone && (
                <p>
                  <strong>Telefone:</strong> {member.phone}
                </p>
              )}
              {member.hourlyRate && (
                <p>
                  <strong>Valor/hora:</strong> R$ {member.hourlyRate.toFixed(2)}
                </p>
              )}
              <p>
                <strong>Status:</strong>{" "}
                {member.attendance ? "Presente" : "Ausente"}
              </p>
              <div className="obras-card-actions">
                <Button variant="secondary">
                  <FiEdit3 /> Editar
                </Button>
                <Button variant="secondary">
                  <FiTrash2 /> Excluir
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderNewTeamForm = () => (
    <div className="obras-form-container">
      <div className="obras-form-card">
        <h2>
          <FiUserCheck /> CADASTRAR MEMBRO DA EQUIPE
        </h2>
        <div className="obras-form-content">
          <div className="obras-form-field">
            <label className="obras-field-label">Nome Completo *</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: João da Silva"
              value={newTeamMember.name || ""}
              onChange={(e) =>
                setNewTeamMember({ ...newTeamMember, name: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Função/Cargo *</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: Pedreiro, Eletricista, Encarregado"
              value={newTeamMember.role || ""}
              onChange={(e) =>
                setNewTeamMember({ ...newTeamMember, role: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">CPF</label>
            <input
              type="text"
              className="obras-select"
              placeholder="000.000.000-00"
              value={newTeamMember.cpf || ""}
              onChange={(e) =>
                setNewTeamMember({ ...newTeamMember, cpf: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Telefone</label>
            <input
              type="text"
              className="obras-select"
              placeholder="(00) 00000-0000"
              value={newTeamMember.phone || ""}
              onChange={(e) =>
                setNewTeamMember({ ...newTeamMember, phone: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Valor por Hora (R$)</label>
            <input
              type="number"
              className="obras-select"
              placeholder="Ex: 25.00"
              step="0.01"
              value={newTeamMember.hourlyRate?.toString() || ""}
              onChange={(e) =>
                setNewTeamMember({
                  ...newTeamMember,
                  hourlyRate: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="obras-form-actions">
            <Button variant="secondary" onClick={() => setViewMode("team")}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const newMember: TeamMember = {
                  id: Date.now().toString(),
                  name: newTeamMember.name || "",
                  role: newTeamMember.role || "",
                  cpf: newTeamMember.cpf,
                  phone: newTeamMember.phone,
                  hourlyRate: newTeamMember.hourlyRate,
                  attendance: false,
                };
                setTeamMembers([...teamMembers, newMember]);
                setViewMode("team");
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Equipment Management
  const renderEquipment = () => (
    <div className="obras-section-container">
      <div className="obras-section-header">
        <h2 className="obras-section-title">
          <FiSettings /> EQUIPAMENTOS
        </h2>
        <Button variant="primary" onClick={() => setViewMode("new-equipment")}>
          <FiPlus /> Novo Equipamento
        </Button>
      </div>

      <div className="obras-grid">
        {equipment.length === 0 ? (
          <div className="obras-empty-state">
            <FiTool size={64} />
            <p>Nenhum equipamento cadastrado</p>
            <Button
              variant="primary"
              onClick={() => setViewMode("new-equipment")}
            >
              Cadastrar Primeiro Equipamento
            </Button>
          </div>
        ) : (
          equipment.map((equip) => (
            <div key={equip.id} className="obras-item-card">
              <h3>{equip.name}</h3>
              <p>
                <strong>Tipo:</strong> {equip.type}
              </p>
              {equip.code && (
                <p>
                  <strong>Código:</strong> {equip.code}
                </p>
              )}
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-${equip.status}`}>{equip.status}</span>
              </p>
              {equip.operator && (
                <p>
                  <strong>Operador:</strong> {equip.operator}
                </p>
              )}
              <div className="obras-card-actions">
                <Button variant="secondary">
                  <FiEdit3 /> Editar
                </Button>
                <Button variant="secondary">
                  <FiTrash2 /> Excluir
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderNewEquipmentForm = () => (
    <div className="obras-form-container">
      <div className="obras-form-card">
        <h2>
          <FiSettings /> CADASTRAR EQUIPAMENTO
        </h2>
        <div className="obras-form-content">
          <div className="obras-form-field">
            <label className="obras-field-label">Nome do Equipamento *</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: Betoneira 400L"
              value={newEquipment.name || ""}
              onChange={(e) =>
                setNewEquipment({ ...newEquipment, name: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Tipo *</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: Betoneira, Serra Circular, Furadeira"
              value={newEquipment.type || ""}
              onChange={(e) =>
                setNewEquipment({ ...newEquipment, type: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Código/Patrimônio</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: EQUIP-001"
              value={newEquipment.code || ""}
              onChange={(e) =>
                setNewEquipment({ ...newEquipment, code: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Status do Equipamento *</label>
            <select
              value={newEquipment.status || "disponivel"}
              onChange={(e) =>
                setNewEquipment({
                  ...newEquipment,
                  status: e.target.value as Equipment["status"],
                })
              }
              className="obras-select"
            >
              <option value="disponivel">Disponível</option>
              <option value="em-uso">Em Uso</option>
              <option value="manutencao">Manutenção</option>
              <option value="quebrado">Quebrado</option>
            </select>
          </div>
          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => setViewMode("equipment")}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const newEquip: Equipment = {
                  id: Date.now().toString(),
                  name: newEquipment.name || "",
                  type: newEquipment.type || "",
                  code: newEquipment.code,
                  status: newEquipment.status || "disponivel",
                };
                setEquipment([...equipment, newEquip]);
                setViewMode("equipment");
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Schedule
  const renderSchedule = () => (
    <div className="obras-section-container">
      <div className="obras-section-header">
        <h2 className="obras-section-title">
          <FiSliders /> CRONOGRAMA
        </h2>
        <Button variant="primary" onClick={() => setViewMode("new-schedule")}>
          <FiPlus /> Nova Tarefa
        </Button>
      </div>

      <div className="obras-list">
        {schedules.length === 0 ? (
          <div className="obras-empty-state">
            <FiCalendar size={64} />
            <p>Nenhuma tarefa cadastrada</p>
            <Button
              variant="primary"
              onClick={() => setViewMode("new-schedule")}
            >
              Cadastrar Primeira Tarefa
            </Button>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div key={schedule.id} className="obras-list-item">
              <h3>{schedule.taskName}</h3>
              <p>
                <strong>Início:</strong>{" "}
                {new Date(schedule.startDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Fim:</strong>{" "}
                {new Date(schedule.endDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Progresso:</strong> {schedule.progress}%
              </p>
              <p>
                <strong>Status:</strong> {schedule.status}
              </p>
              <div className="obras-progress-bar">
                <div
                  className="obras-progress-fill"
                  style={{ width: `${schedule.progress}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderNewScheduleForm = () => (
    <div className="obras-form-container">
      <div className="obras-form-card">
        <h2>
          <FiSliders /> NOVA TAREFA NO CRONOGRAMA
        </h2>
        <div className="obras-form-content">
          <div className="obras-form-field">
            <label className="obras-field-label">Obra *</label>
            <select
              value={newSchedule.projectId || ""}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, projectId: e.target.value })
              }
              className="obras-select"
            >
              <option value="">Selecione a Obra</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Nome da Tarefa *</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: Fundação, Alvenaria 1º Pavimento, Instalações Elétricas"
              value={newSchedule.taskName || ""}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, taskName: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Data de Início *</label>
            <input
              type="date"
              className="obras-select"
              value={newSchedule.startDate || ""}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, startDate: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Data de Término *</label>
            <input
              type="date"
              className="obras-select"
              value={newSchedule.endDate || ""}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, endDate: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Progresso (%)</label>
            <input
              type="number"
              className="obras-select"
              placeholder="0 a 100"
              min="0"
              max="100"
              value={newSchedule.progress?.toString() || "0"}
              onChange={(e) =>
                setNewSchedule({
                  ...newSchedule,
                  progress: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="obras-form-actions">
            <Button variant="secondary" onClick={() => setViewMode("schedule")}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const newSched: Schedule = {
                  id: Date.now().toString(),
                  projectId: newSchedule.projectId || "",
                  taskName: newSchedule.taskName || "",
                  startDate: newSchedule.startDate || "",
                  endDate: newSchedule.endDate || "",
                  progress: newSchedule.progress || 0,
                  status: "em-andamento",
                };
                setSchedules([...schedules, newSched]);
                setViewMode("schedule");
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Safety
  const renderSafety = () => (
    <div className="obras-section-container">
      <div className="obras-section-header">
        <h2 className="obras-section-title">
          <FiShield /> SEGURANÇA DO TRABALHO
        </h2>
        <Button variant="primary" onClick={() => setViewMode("new-safety")}>
          <FiPlus /> Novo Registro
        </Button>
      </div>

      <div className="obras-list">
        {safetyRecords.length === 0 ? (
          <div className="obras-empty-state">
            <FiShield size={64} />
            <p>Nenhum registro de segurança</p>
            <Button variant="primary" onClick={() => setViewMode("new-safety")}>
              Criar Primeiro Registro
            </Button>
          </div>
        ) : (
          safetyRecords.map((record) => (
            <div key={record.id} className="obras-list-item">
              <h3>{record.title}</h3>
              <p>
                <strong>Tipo:</strong> {record.type}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(record.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Responsável:</strong> {record.responsible}
              </p>
              <p>
                <strong>Status:</strong> {record.status}
              </p>
              {record.severity && (
                <p>
                  <strong>Severidade:</strong> {record.severity}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderNewSafetyForm = () => (
    <div className="obras-form-container">
      <div className="obras-form-card">
        <h2>
          <FiShield /> NOVO REGISTRO DE SEGURANÇA
        </h2>
        <div className="obras-form-content">
          <div className="obras-form-field">
            <label className="obras-field-label">Tipo de Registro *</label>
            <select
              value={newSafetyRecord.type || "dds"}
              onChange={(e) =>
                setNewSafetyRecord({
                  ...newSafetyRecord,
                  type: e.target.value as SafetyRecord["type"],
                })
              }
              className="obras-select"
            >
              <option value="dds">DDS - Diálogo Diário de Segurança</option>
              <option value="inspecao">Inspeção</option>
              <option value="acidente">Acidente</option>
              <option value="treinamento">Treinamento</option>
              <option value="epi">Entrega de EPI</option>
            </select>
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Título *</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: DDS sobre uso de EPI em altura"
              value={newSafetyRecord.title || ""}
              onChange={(e) =>
                setNewSafetyRecord({
                  ...newSafetyRecord,
                  title: e.target.value,
                })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Data *</label>
            <input
              type="date"
              className="obras-select"
              value={newSafetyRecord.date || ""}
              onChange={(e) =>
                setNewSafetyRecord({ ...newSafetyRecord, date: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Responsável *</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Nome do técnico de segurança ou responsável"
              value={newSafetyRecord.responsible || ""}
              onChange={(e) =>
                setNewSafetyRecord({
                  ...newSafetyRecord,
                  responsible: e.target.value,
                })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Descrição Detalhada *</label>
            <textarea
              placeholder="Descreva o registro de segurança, participantes, ações tomadas, observações..."
              value={newSafetyRecord.description || ""}
              onChange={(e) =>
                setNewSafetyRecord({
                  ...newSafetyRecord,
                  description: e.target.value,
                })
              }
              className="obras-textarea"
              rows={5}
            />
          </div>
          <div className="obras-form-actions">
            <Button variant="secondary" onClick={() => setViewMode("safety")}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const newRecord: SafetyRecord = {
                  id: Date.now().toString(),
                  projectId: newSafetyRecord.projectId || "",
                  date: newSafetyRecord.date || "",
                  type: newSafetyRecord.type || "dds",
                  title: newSafetyRecord.title || "",
                  description: newSafetyRecord.description || "",
                  responsible: newSafetyRecord.responsible || "",
                  status: "pendente",
                };
                setSafetyRecords([...safetyRecords, newRecord]);
                setViewMode("safety");
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Measurements
  const renderMeasurements = () => (
    <div className="obras-section-container">
      <div className="obras-section-header">
        <h2 className="obras-section-title">
          <FiAward /> MEDIÇÕES E AVANÇO
        </h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("new-measurement")}
        >
          <FiPlus /> Nova Medição
        </Button>
      </div>

      <div className="obras-list">
        {measurements.length === 0 ? (
          <div className="obras-empty-state">
            <FiTrendingUp size={64} />
            <p>Nenhuma medição registrada</p>
            <Button
              variant="primary"
              onClick={() => setViewMode("new-measurement")}
            >
              Registrar Primeira Medição
            </Button>
          </div>
        ) : (
          measurements.map((measurement) => (
            <div key={measurement.id} className="obras-list-item">
              <h3>{measurement.period}</h3>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(measurement.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Avanço Físico:</strong>{" "}
                {measurement.actualPhysicalProgress}% (Previsto:{" "}
                {measurement.plannedPhysicalProgress}%)
              </p>
              <p>
                <strong>Avanço Financeiro:</strong>{" "}
                {measurement.actualFinancialProgress}% (Previsto:{" "}
                {measurement.plannedFinancialProgress}%)
              </p>
              {measurement.approved && (
                <p className="obras-approved">✓ Aprovado</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderNewMeasurementForm = () => (
    <div className="obras-form-container">
      <div className="obras-form-card">
        <h2>
          <FiAward /> NOVA MEDIÇÃO
        </h2>
        <div className="obras-form-content">
          <div className="obras-form-field">
            <label className="obras-field-label">Período *</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: 1ª Medição - Janeiro/2024"
              value={newMeasurement.period || ""}
              onChange={(e) =>
                setNewMeasurement({ ...newMeasurement, period: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Data da Medição *</label>
            <input
              type="date"
              className="obras-select"
              value={newMeasurement.date || ""}
              onChange={(e) =>
                setNewMeasurement({ ...newMeasurement, date: e.target.value })
              }
            />
          </div>
          <div className="obras-form-group">
            <h4 style={{ color: "#1e40af", marginBottom: "10px" }}>
              Avanço Físico
            </h4>
            <div className="obras-form-field">
              <label className="obras-field-label">Previsto (%)</label>
              <input
                type="number"
                className="obras-select"
                placeholder="Ex: 25"
                min="0"
                max="100"
                value={newMeasurement.plannedPhysicalProgress?.toString() || ""}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    plannedPhysicalProgress: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="obras-form-field">
              <label className="obras-field-label">Real/Executado (%)</label>
              <input
                type="number"
                className="obras-select"
                placeholder="Ex: 28"
                min="0"
                max="100"
                value={newMeasurement.actualPhysicalProgress?.toString() || ""}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    actualPhysicalProgress: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="obras-form-group">
            <h4 style={{ color: "#059669", marginBottom: "10px" }}>
              Avanço Financeiro
            </h4>
            <div className="obras-form-field">
              <label className="obras-field-label">Previsto (%)</label>
              <input
                type="number"
                className="obras-select"
                placeholder="Ex: 30"
                min="0"
                max="100"
                value={
                  newMeasurement.plannedFinancialProgress?.toString() || ""
                }
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    plannedFinancialProgress: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="obras-form-field">
              <label className="obras-field-label">Real/Executado (%)</label>
              <input
                type="number"
                className="obras-select"
                placeholder="Ex: 32"
                min="0"
                max="100"
                value={newMeasurement.actualFinancialProgress?.toString() || ""}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    actualFinancialProgress: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => setViewMode("measurements")}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const newMeas: Measurement = {
                  id: Date.now().toString(),
                  projectId: newMeasurement.projectId || "",
                  date: newMeasurement.date || "",
                  period: newMeasurement.period || "",
                  description: newMeasurement.description || "",
                  plannedPhysicalProgress:
                    newMeasurement.plannedPhysicalProgress || 0,
                  actualPhysicalProgress:
                    newMeasurement.actualPhysicalProgress || 0,
                  plannedFinancialProgress:
                    newMeasurement.plannedFinancialProgress || 0,
                  actualFinancialProgress:
                    newMeasurement.actualFinancialProgress || 0,
                };
                setMeasurements([...measurements, newMeas]);
                setViewMode("measurements");
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Issues
  const renderIssues = () => (
    <div className="obras-section-container">
      <div className="obras-section-header">
        <h2 className="obras-section-title">
          <FiAlertTriangle /> PROBLEMAS E NÃO CONFORMIDADES
        </h2>
        <Button variant="primary" onClick={() => setViewMode("new-issue")}>
          <FiPlus /> Novo Problema
        </Button>
      </div>

      <div className="obras-list">
        {issues.length === 0 ? (
          <div className="obras-empty-state">
            <FiAlertTriangle size={64} />
            <p>Nenhum problema registrado</p>
            <Button variant="primary" onClick={() => setViewMode("new-issue")}>
              Registrar Primeiro Problema
            </Button>
          </div>
        ) : (
          issues.map((issue) => (
            <div key={issue.id} className="obras-list-item">
              <h3>{issue.title}</h3>
              <p>
                <strong>Categoria:</strong> {issue.category}
              </p>
              <p>
                <strong>Prioridade:</strong>{" "}
                <span className={`priority-${issue.priority}`}>
                  {issue.priority}
                </span>
              </p>
              <p>
                <strong>Status:</strong> {issue.status}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(issue.date).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderNewIssueForm = () => (
    <div className="obras-form-container">
      <div className="obras-form-card">
        <h2>
          <FiAlertTriangle /> REGISTRAR PROBLEMA
        </h2>
        <div className="obras-form-content">
          <div className="obras-form-field">
            <label className="obras-field-label">Título do Problema *</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: Infiltração na laje do 2º pavimento"
              value={newIssue.title || ""}
              onChange={(e) =>
                setNewIssue({ ...newIssue, title: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Data de Identificação *</label>
            <input
              type="date"
              className="obras-select"
              value={newIssue.date || ""}
              onChange={(e) =>
                setNewIssue({ ...newIssue, date: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Categoria *</label>
            <select
              value={newIssue.category || "tecnico"}
              onChange={(e) =>
                setNewIssue({
                  ...newIssue,
                  category: e.target.value as Issue["category"],
                })
              }
              className="obras-select"
            >
              <option value="tecnico">Técnico</option>
              <option value="financeiro">Financeiro</option>
              <option value="prazo">Prazo</option>
              <option value="qualidade">Qualidade</option>
              <option value="seguranca">Segurança</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Prioridade *</label>
            <select
              value={newIssue.priority || "media"}
              onChange={(e) =>
                setNewIssue({
                  ...newIssue,
                  priority: e.target.value as Issue["priority"],
                })
              }
              className="obras-select"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Descrição Detalhada *</label>
            <textarea
              placeholder="Descreva o problema, causa identificada, impactos, ações necessárias..."
              value={newIssue.description || ""}
              onChange={(e) =>
                setNewIssue({ ...newIssue, description: e.target.value })
              }
              className="obras-textarea"
              rows={5}
            />
          </div>
          <div className="obras-form-actions">
            <Button variant="secondary" onClick={() => setViewMode("issues")}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const newIss: Issue = {
                  id: Date.now().toString(),
                  projectId: newIssue.projectId || "",
                  date: newIssue.date || "",
                  title: newIssue.title || "",
                  description: newIssue.description || "",
                  category: newIssue.category || "tecnico",
                  priority: newIssue.priority || "media",
                  status: "aberto",
                };
                setIssues([...issues, newIss]);
                setViewMode("issues");
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Documents
  const renderDocuments = () => (
    <div className="obras-section-container">
      <div className="obras-section-header">
        <h2 className="obras-section-title">
          <FiArchive /> DOCUMENTOS TÉCNICOS
        </h2>
        <Button variant="primary" onClick={() => setViewMode("new-document")}>
          <FiPlus /> Novo Documento
        </Button>
      </div>

      <div className="obras-list">
        {documents.length === 0 ? (
          <div className="obras-empty-state">
            <FiFile size={64} />
            <p>Nenhum documento cadastrado</p>
            <Button
              variant="primary"
              onClick={() => setViewMode("new-document")}
            >
              Cadastrar Primeiro Documento
            </Button>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="obras-list-item">
              <h3>{doc.name}</h3>
              <p>
                <strong>Tipo:</strong> {doc.type}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(doc.uploadDate).toLocaleDateString()}
              </p>
              {doc.version && (
                <p>
                  <strong>Versão:</strong> {doc.version}
                </p>
              )}
              <div className="obras-card-actions">
                <Button variant="primary">
                  <FiDownload /> Download
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderNewDocumentForm = () => (
    <div className="obras-form-container">
      <div className="obras-form-card">
        <h2>
          <FiArchive /> CADASTRAR DOCUMENTO
        </h2>
        <div className="obras-form-content">
          <div className="obras-form-field">
            <label className="obras-field-label">Nome do Documento *</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: Projeto Estrutural - Blocos Fundação"
              value={newDocument.name || ""}
              onChange={(e) =>
                setNewDocument({ ...newDocument, name: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Tipo de Documento *</label>
            <select
              value={newDocument.type || "projeto"}
              onChange={(e) =>
                setNewDocument({
                  ...newDocument,
                  type: e.target.value as Document["type"],
                })
              }
              className="obras-select"
            >
              <option value="projeto">Projeto</option>
              <option value="art">
                ART - Anotação de Responsabilidade Técnica
              </option>
              <option value="contrato">Contrato</option>
              <option value="licenca">Licença/Alvará</option>
              <option value="orcamento">Orçamento</option>
              <option value="medicao">Medição</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Data de Upload *</label>
            <input
              type="date"
              className="obras-select"
              value={newDocument.uploadDate || ""}
              onChange={(e) =>
                setNewDocument({ ...newDocument, uploadDate: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Versão</label>
            <input
              type="text"
              className="obras-select"
              placeholder="Ex: v1.0, Rev.A, Final"
              value={newDocument.version || ""}
              onChange={(e) =>
                setNewDocument({ ...newDocument, version: e.target.value })
              }
            />
          </div>
          <div className="obras-form-field">
            <label className="obras-field-label">Descrição</label>
            <textarea
              placeholder="Informações adicionais sobre o documento..."
              value={newDocument.description || ""}
              onChange={(e) =>
                setNewDocument({ ...newDocument, description: e.target.value })
              }
              className="obras-textarea"
              rows={4}
            />
          </div>
          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => setViewMode("documents")}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const newDoc: Document = {
                  id: Date.now().toString(),
                  projectId: newDocument.projectId || "",
                  name: newDocument.name || "",
                  type: newDocument.type || "projeto",
                  uploadDate: newDocument.uploadDate || "",
                  description: newDocument.description,
                  version: newDocument.version,
                };
                setDocuments([...documents, newDoc]);
                setViewMode("documents");
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="obras-container">
      {/* Header */}
      <div className="obras-header">
        <Button
          variant="secondary"
          className="obras-back-button"
          onClick={handleBack}
        >
          <FiArrowLeft size={16} />
          Voltar
        </Button>
        <div className="obras-company-brand">
          <h1 className="obras-company-title">GERENCIAMENTO DE OBRAS</h1>
          <span className="obras-company-subtitle">
            Sistema Completo de Gestão de Obras
          </span>
          <div className="obras-company-underline"></div>
        </div>
        <div className="obras-header-spacer"></div>
      </div>

      {/* Main Content */}
      {viewMode === "menu" && renderMenu()}
      {(viewMode === "new" || viewMode === "edit") && renderForm()}
      {viewMode === "history" && renderHistory()}
      {viewMode === "projects" && renderProjects()}
      {viewMode === "inventory" && renderInventory()}
      {viewMode === "budgets" && renderBudgets()}
      {viewMode === "suppliers" && renderSuppliers()}
      {viewMode === "quality" && renderQuality()}
      {viewMode === "reports" && renderReports()}
      {viewMode === "new-inventory" && renderNewInventoryForm()}
      {viewMode === "new-budget" && renderNewBudgetForm()}
      {viewMode === "new-supplier" && renderNewSupplierForm()}
      {viewMode === "new-quality" && renderNewQualityForm()}
      {viewMode === "team" && renderTeam()}
      {viewMode === "new-team" && renderNewTeamForm()}
      {viewMode === "equipment" && renderEquipment()}
      {viewMode === "new-equipment" && renderNewEquipmentForm()}
      {viewMode === "schedule" && renderSchedule()}
      {viewMode === "new-schedule" && renderNewScheduleForm()}
      {viewMode === "safety" && renderSafety()}
      {viewMode === "new-safety" && renderNewSafetyForm()}
      {viewMode === "measurements" && renderMeasurements()}
      {viewMode === "new-measurement" && renderNewMeasurementForm()}
      {viewMode === "issues" && renderIssues()}
      {viewMode === "new-issue" && renderNewIssueForm()}
      {viewMode === "documents" && renderDocuments()}
      {viewMode === "new-document" && renderNewDocumentForm()}

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
