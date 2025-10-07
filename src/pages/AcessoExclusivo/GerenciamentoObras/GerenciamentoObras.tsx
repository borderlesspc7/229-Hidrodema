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
} from "react-icons/fi";
import "./GerenciamentoObras.css";

interface DiaryEntry {
  id: string;
  obraName: string;
  date: string;
  activities: string;
  materials: Material[];
  photos: Photo[];
  observations: string;
  weather: string;
  responsible: string;
  status: "em-andamento" | "concluida" | "pausada";
  createdAt: string;
  updatedAt: string;
}

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

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "planejamento" | "em-andamento" | "concluida" | "pausada";
  budget: number;
  spent: number;
  progress: number;
  milestones: Milestone[];
  team: string[];
  client: string;
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: "pendente" | "em-andamento" | "concluida" | "atrasada";
  progress: number;
  dependencies: string[];
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  alerts: string[];
}

interface Budget {
  id: string;
  projectId: string;
  name: string;
  description: string;
  totalAmount: number;
  spentAmount: number;
  categories: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  items: BudgetItem[];
}

interface BudgetItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
  status: "pendente" | "aprovado" | "comprado" | "entregue";
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  reliability: "excelente" | "bom" | "regular" | "ruim";
  deliveryTime: number;
  paymentTerms: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface QualityChecklist {
  id: string;
  name: string;
  description: string;
  projectId: string;
  items: QualityItem[];
  status: "pendente" | "em-andamento" | "concluida";
  createdAt: string;
  updatedAt: string;
}

interface QualityItem {
  id: string;
  description: string;
  status: "pendente" | "aprovado" | "reprovado";
  notes: string;
  responsible: string;
  checkedAt: string;
}

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
  | "new-project"
  | "new-inventory"
  | "new-budget"
  | "new-supplier"
  | "new-quality";

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

  // Form states for new items
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    client: "",
    budget: 0,
    team: [] as string[],
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

  // Material form
  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materialUnit, setMaterialUnit] = useState("un");

  // Carregar dados do localStorage
  useEffect(() => {
    const savedDiaries = localStorage.getItem("obrasDiaries");
    if (savedDiaries) {
      setDiaryEntries(JSON.parse(savedDiaries));
    }

    const savedProjects = localStorage.getItem("obrasProjects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    const savedInventory = localStorage.getItem("obrasInventory");
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }

    const savedBudgets = localStorage.getItem("obrasBudgets");
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }

    const savedSuppliers = localStorage.getItem("obrasSuppliers");
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    }

    const savedChecklists = localStorage.getItem("obrasQualityChecklists");
    if (savedChecklists) {
      setQualityChecklists(JSON.parse(savedChecklists));
    }
  }, []);

  // Salvar no localStorage
  const saveDiaries = (entries: DiaryEntry[]) => {
    localStorage.setItem("obrasDiaries", JSON.stringify(entries));
    setDiaryEntries(entries);
  };

  const saveProjects = (projects: Project[]) => {
    localStorage.setItem("obrasProjects", JSON.stringify(projects));
    setProjects(projects);
  };

  const saveInventory = (inventory: InventoryItem[]) => {
    localStorage.setItem("obrasInventory", JSON.stringify(inventory));
    setInventory(inventory);
  };

  const saveBudgets = (budgets: Budget[]) => {
    localStorage.setItem("obrasBudgets", JSON.stringify(budgets));
    setBudgets(budgets);
  };

  const saveSuppliers = (suppliers: Supplier[]) => {
    localStorage.setItem("obrasSuppliers", JSON.stringify(suppliers));
    setSuppliers(suppliers);
  };

  const saveQualityChecklists = (checklists: QualityChecklist[]) => {
    localStorage.setItem("obrasQualityChecklists", JSON.stringify(checklists));
    setQualityChecklists(checklists);
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

  const handleSaveDraft = () => {
    if (!obraName || !date) {
      alert("Preencha pelo menos o nome da obra e a data");
      return;
    }

    const entry: DiaryEntry = {
      id: editingEntry?.id || Date.now().toString(),
      obraName,
      date,
      activities,
      materials,
      photos,
      observations,
      weather,
      responsible,
      status,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingEntry) {
      const updated = diaryEntries.map((e) =>
        e.id === editingEntry.id ? entry : e
      );
      saveDiaries(updated);
      alert("Registro atualizado com sucesso!");
    } else {
      saveDiaries([...diaryEntries, entry]);
      alert("Rascunho salvo com sucesso!");
    }

    resetForm();
    setViewMode("history");
  };

  const handleSubmit = () => {
    if (!obraName || !date || !activities) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const entry: DiaryEntry = {
      id: editingEntry?.id || Date.now().toString(),
      obraName,
      date,
      activities,
      materials,
      photos,
      observations,
      weather,
      responsible,
      status,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingEntry) {
      const updated = diaryEntries.map((e) =>
        e.id === editingEntry.id ? entry : e
      );
      saveDiaries(updated);
      alert("Registro atualizado com sucesso!");
    } else {
      saveDiaries([...diaryEntries, entry]);
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
    setViewMode("edit");
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      saveDiaries(diaryEntries.filter((e) => e.id !== id));
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

  // Project Management Functions
  const createProject = (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProjects([...projects, newProject]);
    return newProject;
  };

  // Inventory Management Functions
  const addInventoryItem = (
    item: Omit<InventoryItem, "id" | "lastUpdated" | "alerts">
  ) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
      alerts: [],
    };
    saveInventory([...inventory, newItem]);
    return newItem;
  };

  const checkInventoryAlerts = () => {
    const alerts = inventory.filter((item) => item.quantity <= item.minStock);
    return alerts;
  };

  // Budget Management Functions
  const createBudget = (
    budget: Omit<Budget, "id" | "createdAt" | "updatedAt">
  ) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveBudgets([...budgets, newBudget]);
    return newBudget;
  };

  // Supplier Management Functions
  const addSupplier = (
    supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">
  ) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSuppliers([...suppliers, newSupplier]);
    return newSupplier;
  };

  // Quality Management Functions
  const createQualityChecklist = (
    checklist: Omit<QualityChecklist, "id" | "createdAt" | "updatedAt">
  ) => {
    const newChecklist: QualityChecklist = {
      ...checklist,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveQualityChecklists([...qualityChecklists, newChecklist]);
    return newChecklist;
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
  const handleCreateProject = () => {
    if (!newProject.name || !newProject.startDate || !newProject.endDate) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    createProject({
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
      client: newProject.client,
    });

    alert("Projeto criado com sucesso!");
    resetNewProjectForm();
    setViewMode("projects");
  };

  const handleCreateInventoryItem = () => {
    if (!newInventoryItem.name || !newInventoryItem.category) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    addInventoryItem({
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
    setViewMode("inventory");
  };

  const handleCreateBudget = () => {
    if (!newBudget.name || !newBudget.totalAmount) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    createBudget({
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

  const handleCreateSupplier = () => {
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.email) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    addSupplier({
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

  const handleCreateQualityChecklist = () => {
    if (!newQualityChecklist.name || !newQualityChecklist.projectId) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    createQualityChecklist({
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

  // Render Menu
  const renderMenu = () => (
    <div className="obras-menu-container">
      <div className="obras-menu-cards">
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
          title="CRONOGRAMA"
          textColor="#7c3aed"
          backgroundColor="#faf5ff"
          size="large"
          className="obras-menu-card"
          onClick={() => setViewMode("projects")}
        >
          <div className="obras-menu-card-content">
            <div className="obras-menu-icon">
              <FiTrendingUp size={48} />
            </div>
            <p>Cronograma de obras interativo</p>
            <span className="obras-entry-count">
              {projects.length} projetos
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
                  placeholder="Data"
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
                  <Input
                    type="text"
                    placeholder="Nome do material"
                    value={materialName}
                    onChange={setMaterialName}
                  />
                </div>
                <div className="obras-form-field obras-field-small">
                  <Input
                    type="text"
                    placeholder="Qtd"
                    value={materialQuantity}
                    onChange={setMaterialQuantity}
                  />
                </div>
                <div className="obras-form-field obras-field-small">
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
                  onClick={() => handleDelete(entry.id)}
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

  // Render Projects (Cronograma)
  const renderProjects = () => (
    <div className="obras-projects-container">
      <div className="obras-projects-header">
        <h2>Cronograma de Obras</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-projects-grid">
        <div className="obras-projects-actions">
          <Button
            variant="primary"
            onClick={() => setViewMode("new-project")}
            className="obras-create-btn"
          >
            <FiPlus size={20} />
            Novo Projeto
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiTrendingUp size={64} />
            </div>
            <h3>Nenhum projeto encontrado</h3>
            <p>Crie seu primeiro projeto para começar</p>
            <Button
              variant="primary"
              onClick={() => setViewMode("new-project")}
            >
              Criar Primeiro Projeto
            </Button>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="obras-project-card">
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

  // Render New Project Form
  const renderNewProjectForm = () => (
    <div className="obras-form-container">
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">NOVO PROJETO</h2>
          <p className="obras-form-subtitle">
            Criar novo projeto no cronograma
          </p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiTrendingUp /> Informações do Projeto
            </h3>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome do Projeto *</label>
                <Input
                  type="text"
                  placeholder="Nome do projeto"
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
                  type="number"
                  placeholder="Valor do orçamento"
                  value={newProject.budget.toString()}
                  onChange={(value) =>
                    setNewProject({
                      ...newProject,
                      budget: parseFloat(value) || 0,
                    })
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
                  setNewProject({ ...newProject, description: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => setViewMode("projects")}
              className="obras-action-btn"
            >
              <FiArrowLeft size={16} />
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateProject}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              Criar Projeto
            </Button>
          </div>
        </div>
      </Card>
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
                  type="number"
                  placeholder="Quantidade"
                  value={newInventoryItem.quantity.toString()}
                  onChange={(value) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      quantity: parseInt(value) || 0,
                    })
                  }
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
                  type="number"
                  placeholder="Estoque mínimo"
                  value={newInventoryItem.minStock.toString()}
                  onChange={(value) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      minStock: parseInt(value) || 0,
                    })
                  }
                />
              </div>
              <div className="obras-form-field">
                <label>Estoque Máximo</label>
                <Input
                  type="number"
                  placeholder="Estoque máximo"
                  value={newInventoryItem.maxStock.toString()}
                  onChange={(value) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      maxStock: parseInt(value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Preço Unitário (R$)</label>
                <Input
                  type="number"
                  placeholder="Preço por unidade"
                  value={newInventoryItem.price.toString()}
                  onChange={(value) =>
                    setNewInventoryItem({
                      ...newInventoryItem,
                      price: parseFloat(value) || 0,
                    })
                  }
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
                    <option key={project.id} value={project.id}>
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
                  type="number"
                  placeholder="Valor total do orçamento"
                  value={newBudget.totalAmount.toString()}
                  onChange={(value) =>
                    setNewBudget({
                      ...newBudget,
                      totalAmount: parseFloat(value) || 0,
                    })
                  }
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
                  type="number"
                  placeholder="Dias para entrega"
                  value={newSupplier.deliveryTime.toString()}
                  onChange={(value) =>
                    setNewSupplier({
                      ...newSupplier,
                      deliveryTime: parseInt(value) || 0,
                    })
                  }
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
                    <option key={project.id} value={project.id}>
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
      {viewMode === "new-project" && renderNewProjectForm()}
      {viewMode === "new-inventory" && renderNewInventoryForm()}
      {viewMode === "new-budget" && renderNewBudgetForm()}
      {viewMode === "new-supplier" && renderNewSupplierForm()}
      {viewMode === "new-quality" && renderNewQualityForm()}

      {/* Footer */}
      <div className="obras-footer">
        <img
          src="/src/img/HIDRODEMA_LogoNovo_Branco (2).png"
          alt="HIDRODEMA"
          className="obras-footer-logo"
        />
      </div>
    </div>
  );
}
