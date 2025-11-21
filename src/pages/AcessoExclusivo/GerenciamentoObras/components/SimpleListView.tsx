import Button from "../../../../components/ui/Button/Button";
import { FiArrowLeft, FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";
import type { ViewMode } from "../types";

interface BaseItem {
  id?: string;
}

interface SimpleListViewProps<T extends BaseItem> {
  title: string;
  items: T[];
  emptyMessage: string;
  emptyIcon: React.ReactNode;
  addButtonText: string;
  addViewMode: ViewMode;
  renderItem: (item: T) => React.ReactNode;
  onViewChange: (mode: ViewMode) => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
}

export default function SimpleListView<T extends BaseItem>({
  title,
  items,
  emptyMessage,
  emptyIcon,
  addButtonText,
  addViewMode,
  renderItem,
  onViewChange,
  onEdit,
  onDelete,
}: SimpleListViewProps<T>) {
  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>{title}</h2>
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
          onClick={() => onViewChange(addViewMode)}
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          {addButtonText}
        </Button>
      </div>

      <div className="obras-inventory-grid">
        {items.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">{emptyIcon}</div>
            <h3>{emptyMessage}</h3>
            <Button variant="primary" onClick={() => onViewChange(addViewMode)}>
              {addButtonText}
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="obras-inventory-item">
              {renderItem(item)}
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

