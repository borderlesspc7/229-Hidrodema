import Button from "../../../../../components/ui/Button/Button";
import {
  FiActivity,
  FiArrowLeft,
  FiPlus,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";
import type { Measurement } from "../../../../../services/obrasService";
import type { ViewMode } from "../../types";

interface MeasurementsListProps {
  measurements: Measurement[];
  onViewChange: (mode: ViewMode) => void;
  onEdit: (measurement: Measurement) => void;
  onDelete: (id: string) => void;
}

export default function MeasurementsList({
  measurements,
  onViewChange,
  onEdit,
  onDelete,
}: MeasurementsListProps) {
  return (
    <div className="obras-inventory-container">
      <div className="obras-inventory-header">
        <h2>MEDIÇÕES</h2>
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
          onClick={() => onViewChange("new-measurements")}
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          Nova Medição
        </Button>
      </div>

      <div className="obras-inventory-grid">
        {measurements.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiActivity size={64} />
            </div>
            <h3>Nenhuma medição cadastrada</h3>
            <Button
              variant="primary"
              onClick={() => onViewChange("new-measurements")}
            >
              Criar Primeira Medição
            </Button>
          </div>
        ) : (
          measurements.map((measurement) => (
            <div key={measurement.id} className="obras-inventory-item">
              <div className="obras-item-header">
                <h3>{measurement.period}</h3>
                {measurement.approved ? (
                  <span className="status-concluido">Aprovada</span>
                ) : (
                  <span className="status-pendente">Pendente</span>
                )}
              </div>
              <div className="obras-item-info">
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(measurement.date).toLocaleDateString("pt-BR")}
                </p>
                <p>
                  <strong>Descrição:</strong> {measurement.description}
                </p>
                <p>
                  <strong>Progresso Físico Planejado:</strong>{" "}
                  {measurement.plannedPhysicalProgress}%
                </p>
                <p>
                  <strong>Progresso Físico Real:</strong>{" "}
                  {measurement.actualPhysicalProgress}%
                </p>
                <p>
                  <strong>Progresso Financeiro Planejado:</strong>{" "}
                  {measurement.plannedFinancialProgress}%
                </p>
                <p>
                  <strong>Progresso Financeiro Real:</strong>{" "}
                  {measurement.actualFinancialProgress}%
                </p>
              </div>
              <div className="obras-item-actions">
                <Button
                  variant="secondary"
                  onClick={() => measurement.id && onEdit(measurement)}
                >
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => measurement.id && onDelete(measurement.id)}
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

