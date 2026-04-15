import Card from "../../../../components/ui/Card/Card";
import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import {
  FiFileText,
  FiDollarSign,
  FiActivity,
  FiCheckCircle,
} from "react-icons/fi";

type Props = {
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function ReportsTypeSelector({ setViewMode }: Props) {
  return (
    <div className="obras-form-container">
      <div className="obras-reports-type-grid">
        <Card
          variant="service"
          title="RDO"
          textColor="#1e293b"
          backgroundColor="#f0f9ff"
          size="large"
          className="obras-report-type-card"
          onClick={() => setViewMode("reports-rdo-new")}
        >
          <div className="obras-report-type">
            <FiFileText size={36} />
            <p>Relatório Diário de Obra</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="DESPESAS"
          textColor="#1e293b"
          backgroundColor="#f0fdf4"
          size="large"
          className="obras-report-type-card"
          onClick={() => setViewMode("reports-expense-new")}
        >
          <div className="obras-report-type">
            <FiDollarSign size={36} />
            <p>Despesas da Obra</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="TESTE HIDROSTÁTICO"
          textColor="#1e293b"
          backgroundColor="#faf5ff"
          size="large"
          className="obras-report-type-card"
          onClick={() => setViewMode("reports-hydrostatic-new")}
        >
          <div className="obras-report-type">
            <FiActivity size={36} />
            <p>Registro de teste</p>
          </div>
        </Card>

        <Card
          variant="service"
          title="CONCLUSÃO"
          textColor="#1e293b"
          backgroundColor="#fff7ed"
          size="large"
          className="obras-report-type-card"
          onClick={() => setViewMode("reports-completion-new")}
        >
          <div className="obras-report-type">
            <FiCheckCircle size={36} />
            <p>Conclusão de Obra</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

