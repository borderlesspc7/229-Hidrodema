import Button from "../../../../../components/ui/Button/Button";
import Input from "../../../../../components/ui/Input/Input";
import Card from "../../../../../components/ui/Card/Card";
import {
  FiTruck,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import type { Supplier } from "../../../../../services/obrasService";

interface SuppliersFormProps {
  formData: {
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
  editingItem: Supplier | null;
  onChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function SuppliersForm({
  formData,
  editingItem,
  onChange,
  onSubmit,
  onReset,
  onBack,
}: SuppliersFormProps) {
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
            {editingItem ? "EDITAR FORNECEDOR" : "NOVO FORNECEDOR"}
          </h2>
          <p className="obras-form-subtitle">Cadastro de fornecedores</p>
        </div>

        <div className="obras-form-content">
          <div className="obras-section">
            <h3 className="obras-section-title">
              <FiTruck /> Informações do Fornecedor
            </h3>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Nome do Fornecedor *</label>
                <Input
                  type="text"
                  placeholder="Nome da empresa"
                  value={formData.name}
                  onChange={(value) => onChange("name", value)}
                  required
                />
              </div>
              <div className="obras-form-field">
                <label>Categoria *</label>
                <Input
                  type="text"
                  placeholder="Ex: Materiais, Equipamentos"
                  value={formData.category}
                  onChange={(value) => onChange("category", value)}
                  required
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Pessoa de Contato</label>
                <Input
                  type="text"
                  placeholder="Nome do contato"
                  value={formData.contact}
                  onChange={(value) => onChange("contact", value)}
                />
              </div>
              <div className="obras-form-field">
                <label>Telefone</label>
                <Input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(value) => onChange("phone", value)}
                  mask="phone"
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>Email</label>
              <Input
                type="email"
                placeholder="email@fornecedor.com"
                value={formData.email}
                onChange={(value) => onChange("email", value)}
              />
            </div>
            <div className="obras-form-field">
              <label>Endereço</label>
              <Input
                type="text"
                placeholder="Endereço completo"
                value={formData.address}
                onChange={(value) => onChange("address", value)}
              />
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Confiabilidade</label>
                <select
                  className="obras-select"
                  value={formData.reliability}
                  onChange={(e) => onChange("reliability", e.target.value)}
                >
                  <option value="excelente">Excelente</option>
                  <option value="bom">Bom</option>
                  <option value="regular">Regular</option>
                  <option value="ruim">Ruim</option>
                </select>
              </div>
              <div className="obras-form-field">
                <label>Avaliação (1-5)</label>
                <Input
                  type="text"
                  placeholder="Avaliação"
                  value={formData.rating.toString()}
                  onChange={(value) => {
                    const num = parseInt(value) || 0;
                    onChange("rating", Math.min(5, Math.max(0, num)));
                  }}
                  mask="number"
                  min={0}
                  max={5}
                />
              </div>
            </div>
            <div className="obras-form-row">
              <div className="obras-form-field">
                <label>Prazo de Entrega (dias)</label>
                <Input
                  type="text"
                  placeholder="Dias"
                  value={formData.deliveryTime.toString()}
                  onChange={(value) =>
                    onChange("deliveryTime", parseInt(value) || 0)
                  }
                  mask="number"
                  min={0}
                />
              </div>
              <div className="obras-form-field">
                <label>Condições de Pagamento</label>
                <Input
                  type="text"
                  placeholder="Ex: 30/60 dias"
                  value={formData.paymentTerms}
                  onChange={(value) => onChange("paymentTerms", value)}
                />
              </div>
            </div>
            <div className="obras-form-field">
              <label>Observações</label>
              <textarea
                className="obras-textarea"
                placeholder="Observações sobre o fornecedor..."
                value={formData.notes}
                onChange={(e) => onChange("notes", e.target.value)}
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
              {editingItem ? "Atualizar Fornecedor" : "Salvar Fornecedor"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

