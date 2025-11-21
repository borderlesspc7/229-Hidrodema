import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiFileText,
  FiTool,
  FiPackage,
  FiCamera,
  FiPlus,
  FiTrash2,
  FiSave,
  FiCheckCircle,
} from "react-icons/fi";
import type { Project, DiaryEntry } from "../../../../../services/obrasService";
import type { Material, Photo } from "../../types";

interface DiarioObrasFormProps {
  projects: Project[];
  editingEntry: DiaryEntry | null;
  obraName: string;
  date: string;
  activities: string;
  materials: Material[];
  photos: Photo[];
  observations: string;
  weather: string;
  responsible: string;
  status: DiaryEntry["status"];
  selectedProjectId: string;
  materialName: string;
  materialQuantity: string;
  materialUnit: string;
  onObraNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onActivitiesChange: (value: string) => void;
  onObservationsChange: (value: string) => void;
  onWeatherChange: (value: string) => void;
  onResponsibleChange: (value: string) => void;
  onStatusChange: (value: DiaryEntry["status"]) => void;
  onMaterialNameChange: (value: string) => void;
  onMaterialQuantityChange: (value: string) => void;
  onMaterialUnitChange: (value: string) => void;
  onSelectProject: (projectId: string) => void;
  onAddMaterial: () => void;
  onRemoveMaterial: (id: string) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (id: string) => void;
  onUpdatePhotoDescription: (id: string, description: string) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export default function DiarioObrasForm({
  projects,
  editingEntry,
  obraName,
  date,
  activities,
  materials,
  photos,
  observations,
  weather,
  responsible,
  status,
  selectedProjectId,
  materialName,
  materialQuantity,
  materialUnit,
  onObraNameChange,
  onDateChange,
  onActivitiesChange,
  onObservationsChange,
  onWeatherChange,
  onResponsibleChange,
  onStatusChange,
  onMaterialNameChange,
  onMaterialQuantityChange,
  onMaterialUnitChange,
  onSelectProject,
  onAddMaterial,
  onRemoveMaterial,
  onPhotoUpload,
  onRemovePhoto,
  onUpdatePhotoDescription,
  onSaveDraft,
  onSubmit,
}: DiarioObrasFormProps) {
  return (
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
                  onChange={(e) => onSelectProject(e.target.value)}
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
                  onChange={onObraNameChange}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Data *</label>
                <Input
                  type="date"
                  placeholder=""
                  value={date}
                  onChange={onDateChange}
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
                  onChange={onResponsibleChange}
                />
              </div>
              <div className="obras-form-field">
                <label>Clima</label>
                <select
                  className="obras-select"
                  value={weather}
                  onChange={(e) => onWeatherChange(e.target.value)}
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
                    onStatusChange(e.target.value as DiaryEntry["status"])
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
              onChange={(e) => onActivitiesChange(e.target.value)}
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
                    onChange={(e) => onMaterialNameChange(e.target.value)}
                  />
                </div>
                <div className="obras-form-field obras-field-small">
                  <label className="obras-field-label">Quantidade</label>
                  <input
                    type="text"
                    className="obras-select"
                    placeholder="Qtd"
                    value={materialQuantity}
                    onChange={(e) => onMaterialQuantityChange(e.target.value)}
                  />
                </div>
                <div className="obras-form-field obras-field-small">
                  <label className="obras-field-label">Unidade</label>
                  <select
                    className="obras-select"
                    value={materialUnit}
                    onChange={(e) => onMaterialUnitChange(e.target.value)}
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
                  onClick={onAddMaterial}
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
                            onClick={() => onRemoveMaterial(material.id)}
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
                  onChange={onPhotoUpload}
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
                        onUpdatePhotoDescription(photo.id, e.target.value)
                      }
                      className="obras-photo-description"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => onRemovePhoto(photo.id)}
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
              onChange={(e) => onObservationsChange(e.target.value)}
              rows={4}
            />
          </div>

          {/* Botões de Ação */}
          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={onSaveDraft}
              className="obras-action-btn"
            >
              <FiSave size={16} />
              Salvar Rascunho
            </Button>
            <Button
              variant="primary"
              onClick={onSubmit}
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
}
