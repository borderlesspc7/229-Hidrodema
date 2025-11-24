import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import ProjectSelector from "../shared/ProjectSelector";
import {
  FiPackage,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type { InventoryItem, Project } from "../../../../../services/obrasService";

interface InventoryFormProps {
  projects: Project[];
  formData: {
    projectId?: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minStock: number;
    maxStock: number;
    price: number;
    supplier: string;
    location: string;
  };
  editingItem: InventoryItem | null;
  onChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function InventoryForm({
  projects,
  formData,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: InventoryFormProps) {
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
            {editingItem ? "EDITAR ITEM DE ESTOQUE" : "NOVO ITEM DE ESTOQUE"}
          </h2>
          <p className="obras-form-subtitle">
            Adicionar item ao controle de estoque
          </p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiPackage /> Informações do Item
            </h3>
            <ProjectSelector
              projects={projects}
              value={formData.projectId || ""}
              onChange={(value) => onChange("projectId", value)}
              required={false}
              label="Obra Relacionada (opcional)"
            />
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome do Item *</label>
                <Input
                  type="text"
                  placeholder="Nome do material"
                  value={formData.name}
                  onChange={(value) => onChange("name", value)}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Categoria *</label>
                <Input
                  type="text"
                  placeholder="Categoria do material"
                  value={formData.category}
                  onChange={(value) => onChange("category", value)}
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
                  value={formData.quantity.toString()}
                  onChange={(value) =>
                    onChange("quantity", parseInt(value) || 0)
                  }
                  mask="number"
                  min={0}
                />
              </div>
              <div className="obras-form-field">
                <label>Unidade</label>
                <select
                  className="obras-select"
                  value={formData.unit}
                  onChange={(e) => onChange("unit", e.target.value)}
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
                  value={formData.minStock.toString()}
                  onChange={(value) =>
                    onChange("minStock", parseInt(value) || 0)
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
                  value={formData.maxStock.toString()}
                  onChange={(value) =>
                    onChange("maxStock", parseInt(value) || 0)
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
                  placeholder="Preço"
                  value={(formData.price * 100).toString()}
                  onChange={(value) =>
                    onChange("price", (parseFloat(value) || 0) / 100)
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
                  value={formData.supplier}
                  onChange={(value) => onChange("supplier", value)}
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>Localização</label>
              <Input
                type="text"
                placeholder="Local de armazenamento"
                value={formData.location}
                onChange={(value) => onChange("location", value)}
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
              {editingItem ? "Atualizar Item" : "Salvar Item"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
