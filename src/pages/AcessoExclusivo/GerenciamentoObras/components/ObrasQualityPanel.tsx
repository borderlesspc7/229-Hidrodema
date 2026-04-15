import Button from "../../../../components/ui/Button/Button";
import type { QualityChecklist } from "../../../../types/obrasGerenciamentoModule";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import { FiArrowLeft, FiPlus, FiClipboard, FiEdit3, FiTarget } from "react-icons/fi";

type Props = {
  qualityChecklists: QualityChecklist[];
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function ObrasQualityPanel({
  qualityChecklists,
  setViewMode,
}: Props) {
  return (
    <div className="obras-quality-container">
      <div className="obras-quality-header">
        <h2>Controle de Qualidade</h2>
        <Button
          variant="primary"
          onClick={() => setViewMode("menu")}
          className="obras-back-to-menu"
        >
          <FiArrowLeft size={16} />
          Voltar ao Menu
        </Button>
      </div>

      <div className="obras-quality-actions">
        <Button
          variant="primary"
          onClick={() => setViewMode("new-quality")}
          className="obras-create-btn"
        >
          <FiPlus size={20} />
          Novo Checklist
        </Button>
      </div>

      <div className="obras-quality-grid">
        {qualityChecklists.length === 0 ? (
          <div className="obras-empty-state">
            <div className="obras-empty-icon">
              <FiClipboard size={64} />
            </div>
            <h3>Nenhum checklist encontrado</h3>
            <p>Crie checklists de qualidade</p>
            <Button variant="primary" onClick={() => setViewMode("new-quality")}>
              Criar Primeiro Checklist
            </Button>
          </div>
        ) : (
          qualityChecklists.map((checklist) => (
            <div key={checklist.id} className="obras-quality-card">
              <div className="obras-quality-header">
                <h3>{checklist.name}</h3>
                <span
                  className={`obras-quality-status obras-status-${checklist.status}`}
                >
                  {checklist.status}
                </span>
              </div>
              <div className="obras-quality-info">
                <p>{checklist.description}</p>
                <p>
                  <strong>Itens:</strong> {checklist.items.length}
                </p>
                <p>
                  <strong>Concluídos:</strong>{" "}
                  {checklist.items.filter((i) => i.status === "aprovado").length}
                </p>
              </div>
              <div className="obras-quality-actions">
                <Button variant="secondary">
                  <FiEdit3 size={16} />
                  Editar
                </Button>
                <Button variant="primary">
                  <FiTarget size={16} />
                  Executar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
