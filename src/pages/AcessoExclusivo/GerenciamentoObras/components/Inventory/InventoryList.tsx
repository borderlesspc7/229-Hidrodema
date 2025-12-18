import Button from "../../../../../components/ui/Button/Button";
import {
  FiArrowLeft,
  FiPlus,
  FiPackage,
  FiEdit3,
  FiTrash2,
  FiShoppingCart,
  FiAlertTriangle,
} from "react-icons/fi";
import type { InventoryItem } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";

interface InventoryListProps {
  inventory: InventoryItem[];
  alerts: InventoryItem[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export default function InventoryList({
  inventory,
  alerts,
  onViewChange,
  onEdit,
  onDelete,
}: InventoryListProps) {
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
          onClick={() => onViewChange("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-inventory-actions">
        <Button
          variant="primary"
          onClick={() => onViewChange("new-inventory")}
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
              onClick={() => onViewChange("new-inventory")}
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
                  {item.quantity <= item.minStock ? "Estoque Baixo" : "Normal"}
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
                  <strong>Preço:</strong> R${" "}
                  {item.price.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p>
                  <strong>Fornecedor:</strong> {item.supplier}
                </p>
                <p>
                  <strong>Localização:</strong> {item.location}
                </p>
              </div>
              <div className="obras-item-actions">
                <Button
                  variant="secondary"
                  onClick={() => item.id && onEdit(item)}
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => item.id && onDelete(item.id)}
                  className="obras-delete"
                >
                  <FiTrash2 size={16} />
                  Excluir
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
}

