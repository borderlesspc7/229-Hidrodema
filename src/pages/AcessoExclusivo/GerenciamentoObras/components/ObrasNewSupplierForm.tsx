import type { Dispatch, SetStateAction } from "react";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import Card from "../../../../components/ui/Card/Card";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import type { Project } from "../../../../types/obrasGerenciamentoModule";
import { FiArrowLeft, FiTruck, FiCheckCircle } from "react-icons/fi";
import ProjectSelector from "./ProjectSelector";

export type NewSupplierState = {
  projectId: string;
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
};

type Props = {
  projects: Project[];
  newSupplier: NewSupplierState;
  setNewSupplier: Dispatch<SetStateAction<NewSupplierState>>;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
  onSubmit: () => void | Promise<void>;
};

export default function ObrasNewSupplierForm({
  projects,
  newSupplier,
  setNewSupplier,
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
          <h2 className="obras-form-title">NOVO FORNECEDOR</h2>
          <p className="obras-form-subtitle">Cadastrar novo fornecedor</p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiTruck /> Informações do Fornecedor
            </h3>
            <ProjectSelector
              projects={projects}
              value={newSupplier.projectId}
              onChange={(projectId) => setNewSupplier({ ...newSupplier, projectId })}
              allowEmpty
              label="Obra (opcional)"
            />
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
                      reliability: e.target.value as NewSupplierState["reliability"],
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
                      deliveryTime: parseInt(value, 10) || 0,
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
              onClick={() => void onSubmit()}
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
}
