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

  const getReliabilityClass = (reliability: string) => {
    const normalized = (reliability || "").toLowerCase();
    if (["excelente", "bom", "regular", "ruim"].includes(normalized)) {
      return `reliability-${normalized}`;
    }
    return "";
  };

  return (
    <section
      className="obras-inventory-container"
      aria-labelledby="obras-suppliers-title"
    >
      <header className="obras-inventory-header">
        <h2 id="obras-suppliers-title">FORNECEDORES</h2>
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
            onClick={() => onViewChange("new-supplier")}
            className="obras-create-btn"
          >
            <FiPlus size={20} aria-hidden />
            Novo Fornecedor
          </Button>
        </div>
      </header>

      <div className="obras-inventory-controls" role="search" aria-label="Filtrar fornecedores por obra">
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
              <FiTruck size={64} aria-hidden />
            </div>
            <h3>Nenhum fornecedor cadastrado</h3>
            <p>Adicione fornecedores ao sistema</p>
            <Button
              variant="primary"
              onClick={() => onViewChange("new-supplier")}
            >
              Cadastrar Primeiro Fornecedor
            </Button>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <article key={supplier.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{supplier.name}</h3>
                <span
                  className={`reliability-badge ${getReliabilityClass(supplier.reliability)}`}
                  aria-label={`Confiabilidade: ${getReliabilityLabel(supplier.reliability)}`}
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
                  aria-label={`Editar fornecedor ${supplier.name}`}
                >
                  <FiEdit3 size={16} aria-hidden />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => supplier.id && onDelete(supplier.id)}
                  className="obras-delete"
                  aria-label={`Excluir fornecedor ${supplier.name}`}
                >
                  <FiTrash2 size={16} aria-hidden />
                  Excluir
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

