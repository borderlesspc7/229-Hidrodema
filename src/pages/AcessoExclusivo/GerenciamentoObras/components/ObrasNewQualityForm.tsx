import type { Dispatch, SetStateAction } from "react";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import Card from "../../../../components/ui/Card/Card";
import type { Project } from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import {
  FiArrowLeft,
  FiClipboard,
  FiTarget,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";

export type NewQualityChecklistState = {
  name: string;
  description: string;
  projectId: string;
  items: { description: string; responsible: string }[];
};

type Props = {
  projects: Project[];
  newQualityChecklist: NewQualityChecklistState;
  setNewQualityChecklist: Dispatch<SetStateAction<NewQualityChecklistState>>;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void | Promise<void>;
};

export default function ObrasNewQualityForm({
  projects,
  newQualityChecklist,
  setNewQualityChecklist,
  setViewMode,
  onAddItem,
  onRemoveItem,
  onSubmit,
}: Props) {
  return (
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
                      onClick={() => onRemoveItem(index)}
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
              onClick={onAddItem}
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
              onClick={() => void onSubmit()}
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
}
