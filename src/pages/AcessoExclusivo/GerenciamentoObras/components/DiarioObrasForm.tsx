import { useState } from "react";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import Card from "../../../../components/ui/Card/Card";
import type {
  DiaryEntry,
  Material,
  Photo,
  Project,
} from "../../../../types/obrasGerenciamentoModule";
import {
  FiFileText,
  FiSave,
  FiTool,
  FiPackage,
  FiCamera,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";

type Props = {
  editingEntry: DiaryEntry | null;
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  obraName: string;
  setObraName: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  responsible: string;
  setResponsible: (v: string) => void;
  weather: string;
  setWeather: (v: string) => void;
  status: DiaryEntry["status"];
  setStatus: (v: DiaryEntry["status"]) => void;
  activities: string;
  setActivities: (v: string) => void;
  materialName: string;
  setMaterialName: (v: string) => void;
  materialQuantity: string;
  setMaterialQuantity: (v: string) => void;
  materialUnit: string;
  setMaterialUnit: (v: string) => void;
  materials: Material[];
  onAddMaterial: () => void;
  onRemoveMaterial: (id: string) => void;
  photos: Photo[];
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (id: string) => void;
  onUpdatePhotoDescription: (id: string, description: string) => void;
  observations: string;
  setObservations: (v: string) => void;
  onSaveDraft: () => void | Promise<void>;
  onSubmit: () => void | Promise<void>;
};

export default function DiarioObrasForm(props: Props) {
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const {
    editingEntry,
    projects,
    selectedProjectId,
    onSelectProject,
    obraName,
    setObraName,
    date,
    setDate,
    responsible,
    setResponsible,
    weather,
    setWeather,
    status,
    setStatus,
    activities,
    setActivities,
    materialName,
    setMaterialName,
    materialQuantity,
    setMaterialQuantity,
    materialUnit,
    setMaterialUnit,
    materials,
    onAddMaterial,
    onRemoveMaterial,
    photos,
    onPhotoUpload,
    onRemovePhoto,
    onUpdatePhotoDescription,
    observations,
    setObservations,
    onSaveDraft,
    onSubmit,
  } = props;

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
                    <option key={project.id} value={project.id}>
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
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(photo)}
                      className="obras-photo-preview-btn"
                      aria-label="Abrir foto"
                    >
                      <img src={photo.dataUrl} alt={photo.name} />
                    </button>
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

          {previewPhoto && (
            <div
              className="obras-photo-modal"
              role="dialog"
              aria-modal="true"
              onClick={() => setPreviewPhoto(null)}
            >
              <div
                className="obras-photo-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="obras-photo-modal-header">
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <strong>{previewPhoto.description || previewPhoto.name}</strong>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>
                      {previewPhoto.name}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setPreviewPhoto(null)}
                    className="obras-action-btn"
                  >
                    Fechar
                  </Button>
                </div>
                <img
                  src={previewPhoto.dataUrl}
                  alt={previewPhoto.name}
                  className="obras-photo-modal-img"
                />
              </div>
            </div>
          )}

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

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={() => void onSaveDraft()}
              className="obras-action-btn"
            >
              <FiSave size={16} />
              Salvar Rascunho
            </Button>
            <Button
              variant="primary"
              onClick={() => void onSubmit()}
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
