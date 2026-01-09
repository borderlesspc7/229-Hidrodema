import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import { FiTruck, FiArrowLeft, FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";
import type { Supplier, Project } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";
import ProjectFilter from "../shared/ProjectFilter";
import ProjectBadge from "../shared/ProjectBadge";

interface SuppliersListProps {
  suppliers: Supplier[];
  projects: Project[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export default function SuppliersList({
  suppliers,
  projects,
  onViewChange,
  onEdit,
  onDelete,
}: SuppliersListProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Filtrar fornecedores por obra
  const filteredSuppliers =
    selectedProjectId === "" || selectedProjectId === "all"
      ? suppliers
      : suppliers.filter((supplier) => supplier.projectId === selectedProjectId);

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case "excelente":
        return "#10b981";
      case "bom":
        return "#3b82f6";
      case "regular":
        return "#f59e0b";
      case "ruim":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getReliabilityLabel = (reliability: string) => {
    switch (reliability) {
      case "excelente":
        return "Excelente";
      case "bom":
        return "Bom";
      case "regular":
        return "Regular";
      case "ruim":
        return "Ruim";
      default:
        return reliability;
    }
  };

  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>FORNECEDORES</h2>
        <Button
          variant="primary"
          onClick={() => onViewChange("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-inventory-controls">
        <div className="obras-inventory-actions">
          <Button
            variant="primary"
            onClick={() => onViewChange("new-supplier")}
            className="obras-create-btn"
          >
            <FiPlus size={20} />
            Novo Fornecedor
          </Button>
        </div>
        <ProjectFilter
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      </div>

      <div className="obras-inventory-grid">
        {filteredSuppliers.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiTruck size={64} />
            </div>
            <h3>Nenhum fornecedor cadastrado</h3>
            <Button
              variant="primary"
              onClick={() => onViewChange("new-supplier")}
            >
              Cadastrar Primeiro Fornecedor
            </Button>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{supplier.name}</h3>
                <span
                  className="reliability-badge"
                  style={{
                    color: "#ffffff",
                    background: getReliabilityColor(supplier.reliability),
                    padding: "8px 16px",
                    borderRadius: "24px",
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "inline-flex",
                    alignItems: "center",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {getReliabilityLabel(supplier.reliability)}
                </span>
              </div>
              <div className="obras-badge-container">
                <ProjectBadge
                  projectId={supplier.projectId}
                  projects={projects}
                  size="medium"
                />
              </div>
              <div className="obras-item-info">
                <p>
                  <strong>Categoria:</strong> {supplier.category}
                </p>
                <p>
                  <strong>Contato:</strong> {supplier.contact}
                </p>
                <p>
                  <strong>Telefone:</strong> {supplier.phone}
                </p>
                <p>
                  <strong>Email:</strong> {supplier.email}
                </p>
                <p>
                  <strong>Avaliação:</strong> {supplier.rating}/5 ⭐
                </p>
                <p>
                  <strong>Prazo de Entrega:</strong> {supplier.deliveryTime}{" "}
                  dias
                </p>
              </div>
              <div className="obras-item-actions">
                <Button
                  variant="secondary"
                  onClick={() => supplier.id && onEdit(supplier)}
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => supplier.id && onDelete(supplier.id)}
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

