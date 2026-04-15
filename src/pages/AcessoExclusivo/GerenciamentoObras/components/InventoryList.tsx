import Button from "../../../../components/ui/Button/Button";
import type { InventoryItem, Project } from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import {
  FiArrowLeft,
  FiAlertTriangle,
  FiPlus,
  FiPackage,
  FiEdit3,
  FiShoppingCart,
} from "react-icons/fi";
import ProjectBadge from "./ProjectBadge";

type Props = {
  inventory: InventoryItem[];
  lowStockAlerts: InventoryItem[];
  projects: Project[];
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function InventoryList({
  inventory,
  lowStockAlerts,
  projects,
  setViewMode,
}: Props) {
  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>Controle de Estoque</h2>
        {lowStockAlerts.length > 0 && (
          <div className="obras-alert-banner">
            <FiAlertTriangle size={20} />
            <span>{lowStockAlerts.length} itens com estoque baixo</span>
          </div>
        )}
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-inventory-actions">
        <Button
          variant="primary"
          onClick={() => setViewMode("new-inventory")}
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
              onClick={() => setViewMode("new-inventory")}
            >
              Adicionar Primeiro Item
            </Button>
          </div>
        ) : (
          inventory.map((item) => (
            <div key={item.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <h3>{item.name}</h3>
                  <ProjectBadge projectId={item.projectId} projects={projects} />
                </div>
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
                  <strong>Preço:</strong> R$ {item.price.toFixed(2)}
                </p>
                <p>
                  <strong>Fornecedor:</strong> {item.supplier}
                </p>
                <p>
                  <strong>Localização:</strong> {item.location}
                </p>
              </div>
              <div className="obras-item-actions">
                <Button variant="secondary">
                  <FiEdit3 size={16} />
                  Editar
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
