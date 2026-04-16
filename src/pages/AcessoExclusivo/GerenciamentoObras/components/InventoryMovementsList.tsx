import Button from "../../../../components/ui/Button/Button";
import type {
  InventoryItem,
  InventoryMovement,
  Project,
  Supplier,
} from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import { FiArrowLeft, FiClock, FiTrendingUp } from "react-icons/fi";
import ProjectBadge from "./ProjectBadge";

type Props = {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  suppliers: Supplier[];
  projects: Project[];
  projectFilterId: string;
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function InventoryMovementsList({
  inventory,
  movements,
  projects,
  projectFilterId,
  setViewMode,
}: Props) {
  const scoped = projectFilterId
    ? movements.filter((m) => m.projectId === projectFilterId)
    : movements;

  const findItem = (id: string) => inventory.find((i) => i.id === id);

  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>Histórico de Movimentações</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("inventory")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Estoque
        </Button>
      </div>

      <div className="obras-inventory-grid">
        {scoped.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiClock size={64} />
            </div>
            <h3>Nenhuma movimentação registrada</h3>
            <p>Registre uma entrada de materiais para começar o histórico</p>
            <Button variant="primary" onClick={() => setViewMode("inventory-entry")}>
              <FiTrendingUp size={16} />
              Nova Entrada
            </Button>
          </div>
        ) : (
          scoped.map((m) => {
            const item = findItem(m.itemId);
            const title = item ? item.name : `Item ${m.itemId}`;
            return (
              <div key={m.id} className="obras-inventory-item">
                <div className="obras-item-header">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <h3>{title}</h3>
                    <ProjectBadge projectId={m.projectId} projects={projects} />
                  </div>
                  <span
                    className={`obras-item-status ${
                      m.type === "entrada" ? "normal" : "low"
                    }`}
                  >
                    {m.type.toUpperCase()}
                  </span>
                </div>
                <div className="obras-item-info">
                  <p>
                    <strong>Data:</strong> {m.receivedAt}
                  </p>
                  <p>
                    <strong>Quantidade:</strong> {m.quantityDelta} {m.unit}
                  </p>
                  {m.category && (
                    <p>
                      <strong>Categoria:</strong> {m.category}
                    </p>
                  )}
                  {m.supplier && (
                    <p>
                      <strong>Fornecedor:</strong> {m.supplier}
                    </p>
                  )}
                  {m.notes && (
                    <p>
                      <strong>Obs:</strong> {m.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

