import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiFile,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type {
  DocumentRecord,
  Project,
} from "../../../../../services/obrasService";

interface DocumentsFormProps {
  formData: {
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
    fileUrl: string;
    description: string;
    version: string;
    uploadedBy: string;
  };
  projects: Project[];
  editingItem: DocumentRecord | null;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function DocumentsForm({
  formData,
  projects,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: DocumentsFormProps) {
  return (
    <div className="obras-form-container">
      <Button variant="secondary" onClick={onBack} className="obras-back-btn">
        <FiArrowLeft size={16} />
        Voltar
      </Button>
      <Card
        variant="service"
        className="obras-form-card"
        title=""
        textColor="#1e293b"
      >
        <div className="obras-form-header">
          <h2 className="obras-form-title">
            {editingItem ? "EDITAR DOCUMENTO" : "NOVO DOCUMENTO"}
          </h2>
          <p className="obras-form-subtitle">Cadastro de documentos da obra</p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiFile /> Informações do Documento
            </h3>
            <div className="obras-form-field">
              <label>Obra *</label>
              <select
                className="obras-select"
                value={formData.projectId}
                onChange={(e) => onChange("projectId", e.target.value)}
              >
                <option value="">Selecione uma obra</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id || ""}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome do Documento *</label>
                <Input
                  type="text"
                  placeholder="Nome do documento"
                  value={formData.name}
                  onChange={(value) => onChange("name", value)}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Tipo *</label>
                <select
                  className="obras-select"
                  value={formData.type}
                  onChange={(e) => onChange("type", e.target.value)}
                >
                  <option value="projeto">Projeto</option>
                  <option value="art">ART</option>
                  <option value="contrato">Contrato</option>
                  <option value="licenca">Licença</option>
                  <option value="orcamento">Orçamento</option>
                  <option value="medicao">Medição</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Data de Upload</label>
                <Input
                  type="date"
                  placeholder=""
                  value={formData.uploadDate}
                  onChange={(value) => onChange("uploadDate", value)}
                />
              </div>
              <div className="obras-form-field">
                <label>Versão</label>
                <Input
                  type="text"
                  placeholder="Ex: 1.0, Rev. A"
                  value={formData.version}
                  onChange={(value) => onChange("version", value)}
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>URL do Arquivo</label>
              <Input
                type="text"
                placeholder="Link para o arquivo"
                value={formData.fileUrl}
                onChange={(value) => onChange("fileUrl", value)}
              />
            </div>
            <div className="obras-form-field">
              <label>Enviado por</label>
              <Input
                type="text"
                placeholder="Nome de quem enviou"
                value={formData.uploadedBy}
                onChange={(value) => onChange("uploadedBy", value)}
              />
            </div>
            <div className="obras-form-field">
              <label>Descrição</label>
              <textarea
                className="obras-textarea"
                placeholder="Descrição do documento..."
                value={formData.description}
                onChange={(e) => onChange("description", e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="obras-form-actions">
            <Button
              variant="secondary"
              onClick={onReset}
              className="obras-action-btn"
            >
              <FiRefreshCw size={16} />
              Limpar
            </Button>
            <Button
              variant="primary"
              onClick={onSubmit}
              className="obras-action-btn obras-submit-btn"
            >
              <FiCheckCircle size={16} />
              {editingItem ? "Atualizar Documento" : "Salvar Documento"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

