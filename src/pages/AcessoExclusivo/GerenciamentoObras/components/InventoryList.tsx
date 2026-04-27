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
  FiTrendingUp,
  FiList,
} from "react-icons/fi";
import ProjectBadge from "./ProjectBadge";
import { useMemo, useState } from "react";
import type { ViewChangeContext } from "../gerenciamentoObras.types";

type Props = {
  inventory: InventoryItem[];
  lowStockAlerts: InventoryItem[];
  projects: Project[];
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
  projectId?: string;
  onCreateNew?: (ctx: ViewChangeContext) => void;
};

function getStockStatus(item: InventoryItem) {
  const q = Number(item.quantity ?? 0);
  const min = Number(item.minStock ?? 0);
  if (q <= 0) return { key: "out", label: "Sem estoque", severity: 3 };
  if (min > 0 && q <= min) return { key: "critical", label: "Crítico", severity: 2 };
  if (min > 0 && q <= min * 1.2) return { key: "low", label: "Baixo", severity: 1 };
  return { key: "normal", label: "Normal", severity: 0 };
}

export default function InventoryList({
  inventory,
  lowStockAlerts,
  projects,
  setViewMode,
  projectId,
  onCreateNew,
}: Props) {
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  const filteredInventory = useMemo(() => {
    if (!onlyAlerts) return inventory;
    const ids = new Set(lowStockAlerts.map((i) => i.id));
    return inventory.filter((i) => ids.has(i.id));
  }, [inventory, lowStockAlerts, onlyAlerts]);

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
          onClick={() =>
            onCreateNew ? onCreateNew({ projectId }) : setViewMode("new-inventory")
          }
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          Novo Item{projectId ? " (nesta obra)" : ""}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setViewMode("inventory-entry")}
          className="obras-create-btn"
        >
          <FiTrendingUp size={20} />
          Entrada de Materiais
        </Button>
        <Button
          variant="secondary"
          onClick={() => setViewMode("inventory-movements")}
          className="obras-create-btn"
        >
          <FiList size={20} />
          Histórico
        </Button>
        {lowStockAlerts.length > 0 && (
          <Button
            variant={onlyAlerts ? "primary" : "secondary"}
            onClick={() => setOnlyAlerts((v) => !v)}
            className="obras-create-btn"
          >
            <FiAlertTriangle size={20} />
            {onlyAlerts ? "Ver Todos" : "Só Alertas"}
          </Button>
        )}
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
              onClick={() => setViewMode("new-inventory")}
            >
              Adicionar Primeiro Item
            </Button>
          </div>
        ) : (
          filteredInventory.map((item) => (
            <div key={item.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <h3>{item.name}</h3>
                  <ProjectBadge projectId={item.projectId} projects={projects} />
                </div>
                {(() => {
                  const s = getStockStatus(item);
                  const title =
                    s.key === "normal"
                      ? "Dentro do limite"
                      : `Status: ${s.label} (Qtd: ${item.quantity} / Mín: ${item.minStock})`;
                  return (
                    <span
                      className={`obras-item-status ${s.key}`}
                      title={title}
                    >
                      {s.label}
                    </span>
                  );
                })()}
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
