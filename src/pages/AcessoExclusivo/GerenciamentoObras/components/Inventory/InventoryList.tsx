import { useState } from "react";
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
import type { InventoryItem, Project } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";
import { pluralize } from "../../../../../utils/pluralize";
import ProjectFilter from "../shared/ProjectFilter";
import ProjectBadge from "../shared/ProjectBadge";

interface InventoryListProps {
  inventory: InventoryItem[];
  projects: Project[];
  alerts: InventoryItem[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export default function InventoryList({
  inventory,
  projects,
  alerts,
  onViewChange,
  onEdit,
  onDelete,
}: InventoryListProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Filtrar inventário por obra
  const filteredInventory =
    selectedProjectId === "" || selectedProjectId === "all"
      ? inventory
      : inventory.filter((item) => item.projectId === selectedProjectId);

  return (
    <section
      className="obras-inventory-container"
      aria-labelledby="obras-inventory-title"
    >
      <header className="obras-inventory-header">
        <h2 id="obras-inventory-title">Controle de Estoque</h2>
        {alerts.length > 0 && (
          <div className="obras-alert-banner" role="alert">
            <FiAlertTriangle size={20} aria-hidden />
            <span>{pluralize(alerts.length, "item com estoque baixo", "itens com estoque baixo")}</span>
          </div>
        )}
        <div className="obras-inventory-header-actions">
          <Button
            variant="primary"
            onClick={() => onViewChange("menu")}
            className="obras-back-to-menu"
          >
            <FiArrowLeft size={16} aria-hidden />
            Voltar ao Menu
          </Button>
          <Button
            variant="primary"
            onClick={() => onViewChange("new-inventory")}
            className="obras-create-btn"
          >
            <FiPlus size={20} aria-hidden />
            Novo Item
          </Button>
        </div>
      </header>

      <div className="obras-inventory-controls" role="search" aria-label="Filtrar itens por obra">
        <ProjectFilter
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      </div>

      <div className="obras-inventory-grid">
        {filteredInventory.length === 0 ? (
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
          filteredInventory.map((item) => (
            <article key={item.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{item.name}</h3>
                <span
                  className={`obras-item-status ${
                    item.quantity <= item.minStock ? "low-stock" : "normal"
                  }`}
                  aria-label={item.quantity <= item.minStock ? "Estoque baixo" : "Estoque normal"}
                >
                  {item.quantity <= item.minStock ? "Estoque Baixo" : "Normal"}
                </span>
              </div>
              <div className="obras-badge-container">
                <ProjectBadge
                  projectId={item.projectId}
                  projects={projects}
                  size="medium"
                />
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
                  aria-label={`Editar ${item.name}`}
                >
                  <FiEdit3 size={16} aria-hidden />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => item.id && onDelete(item.id)}
                  className="obras-delete"
                  aria-label={`Excluir ${item.name}`}
                >
                  <FiTrash2 size={16} aria-hidden />
                  Excluir
                </Button>
                <Button variant="primary" aria-label={`Comprar ${item.name}`}>
                  <FiShoppingCart size={16} aria-hidden />
                  Comprar
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

