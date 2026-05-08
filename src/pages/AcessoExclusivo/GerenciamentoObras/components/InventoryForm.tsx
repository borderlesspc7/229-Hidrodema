import type { Dispatch, SetStateAction } from "react";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import Card from "../../../../components/ui/Card/Card";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import type { Project } from "../../../../types/obrasGerenciamentoModule";
import {
  FiArrowLeft,
  FiPackage,
  FiCheckCircle,
} from "react-icons/fi";
import ProjectSelector from "./ProjectSelector";

export type NewInventoryFormState = {
  projectId: string;
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

type Props = {
  projects: Project[];
  newInventoryItem: NewInventoryFormState;
  setNewInventoryItem: Dispatch<SetStateAction<NewInventoryFormState>>;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
  onSubmit: () => void | Promise<void>;
};

export default function InventoryForm({
  projects,
  newInventoryItem,
  setNewInventoryItem,
  setViewMode,
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
            <ProjectSelector
              projects={projects}
              value={newInventoryItem.projectId}
              onChange={(projectId) =>
                setNewInventoryItem({ ...newInventoryItem, projectId })
              }
              required
              allowEmpty
            />
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
                      quantity: parseInt(value, 10) || 0,
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
                      minStock: parseInt(value, 10) || 0,
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
                      maxStock: parseInt(value, 10) || 0,
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
              onClick={() => void onSubmit()}
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
}
