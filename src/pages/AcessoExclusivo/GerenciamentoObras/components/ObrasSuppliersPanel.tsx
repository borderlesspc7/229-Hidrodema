import Button from "../../../../components/ui/Button/Button";
import type { Project, Supplier } from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import { FiArrowLeft, FiPlus, FiTruck, FiEdit3, FiUsers, FiStar } from "react-icons/fi";
import ProjectBadge from "./ProjectBadge";

type Props = {
  suppliers: Supplier[];
  projects: Project[];
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function ObrasSuppliersPanel({ suppliers, projects, setViewMode }: Props) {
  return (
    <div className="obras-suppliers-container">
      <div className="obras-suppliers-header">
        <h2>Gestão de Fornecedores</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-suppliers-actions">
        <Button
          variant="primary"
          onClick={() => setViewMode("new-supplier")}
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          Novo Fornecedor
        </Button>
      </div>

      <div className="obras-suppliers-grid">
        {suppliers.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiTruck size={64} />
            </div>
            <h3>Nenhum fornecedor cadastrado</h3>
            <p>Cadastre seus fornecedores</p>
            <Button variant="primary" onClick={() => setViewMode("new-supplier")}>
              Cadastrar Primeiro Fornecedor
            </Button>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <div key={supplier.id} className="obras-supplier-card">
              <div className="obras-supplier-header">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <h3>{supplier.name}</h3>
                  <ProjectBadge projectId={supplier.projectId} projects={projects} fallbackLabel="Sem obra" />
                </div>
                <div className="obras-supplier-rating">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={16}
                      color={i < supplier.rating ? "#fbbf24" : "#d1d5db"}
                    />
                  ))}
                </div>
              </div>
              <div className="obras-supplier-info">
                <p>
                  <strong>Contato:</strong> {supplier.contact}
                </p>
                <p>
                  <strong>Email:</strong> {supplier.email}
                </p>
                <p>
                  <strong>Telefone:</strong> {supplier.phone}
                </p>
                <p>
                  <strong>Categoria:</strong> {supplier.category}
                </p>
                <p>
                  <strong>Confiabilidade:</strong> {supplier.reliability}
                </p>
                <p>
                  <strong>Prazo de Entrega:</strong> {supplier.deliveryTime} dias
                </p>
              </div>
              <div className="obras-supplier-actions">
                <Button variant="secondary">
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button variant="primary">
                  <FiUsers size={16} />
                  Contatar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
