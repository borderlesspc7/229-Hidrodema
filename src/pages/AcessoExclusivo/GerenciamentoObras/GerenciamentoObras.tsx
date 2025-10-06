import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Card from "../../../components/ui/Card/Card";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
  FiUpload,
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
}

interface Photo {
  id: string;
  name: string;
  description: string;
  dataUrl: string;
}

type ViewMode = "menu" | "new" | "history" | "edit";

export default function GerenciamentoObras() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

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
    const saved = localStorage.getItem("obrasDiaries");
    if (saved) {
      setDiaryEntries(JSON.parse(saved));
    }
  }, []);

  // Salvar no localStorage
  const saveDiaries = (entries: DiaryEntry[]) => {
    localStorage.setItem("obrasDiaries", JSON.stringify(entries));
    setDiaryEntries(entries);
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
            Diário de Obra - Controle e Acompanhamento
          </span>
          <div className="obras-company-underline"></div>
        </div>
        <div className="obras-header-spacer"></div>
      </div>

      {/* Main Content */}
      {viewMode === "menu" && renderMenu()}
      {(viewMode === "new" || viewMode === "edit") && renderForm()}
      {viewMode === "history" && renderHistory()}

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
