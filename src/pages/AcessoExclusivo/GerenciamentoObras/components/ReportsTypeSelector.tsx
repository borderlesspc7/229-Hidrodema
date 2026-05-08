import type { GerenciamentoObrasViewMode } from "../gerenciamentoObras.types";
import {
  FiFileText,
  FiDollarSign,
  FiDroplet,
} from "react-icons/fi";

type Props = {
  setViewMode: (mode: GerenciamentoObrasViewMode) => void;
};

export default function ReportsTypeSelector({ setViewMode }: Props) {
  return (
    <div className="obras-report-select">
      <div className="obras-report-select-header">
        <h2>SELECIONE O TIPO DE REGISTRO</h2>
        <p>Escolha o tipo de registro que deseja criar</p>
      </div>

      <div className="obras-report-select-grid">
        <div className="obras-report-select-card">
          <div className="obras-report-select-icon obras-report-select-icon--blue">
            <FiFileText size={28} />
          </div>
          <h3 className="obras-report-select-title obras-report-select-title--blue">
            RDO - Relatório Diário de Obra
          </h3>
          <p className="obras-report-select-desc">
            Registro completo do dia: horário de trabalho, mão de obra,
            equipamentos, atividades, ocorrências, fotos e aprovação.
          </p>
          <button
            className="obras-report-select-cta"
            type="button"
            onClick={() => setViewMode("reports-rdo-new")}
          >
            Criar Registro
          </button>
        </div>

        <div className="obras-report-select-card">
          <div className="obras-report-select-icon obras-report-select-icon--green">
            <FiDollarSign size={28} />
          </div>
          <h3 className="obras-report-select-title obras-report-select-title--green">
            Lançamento de Gastos
          </h3>
          <p className="obras-report-select-desc">
            Registro de despesas e gastos da obra com comprovantes, valores e
            aprovação.
          </p>
          <button
            className="obras-report-select-cta"
            type="button"
            onClick={() => setViewMode("reports-expense-new")}
          >
            Criar Registro
          </button>
        </div>

        <div className="obras-report-select-card">
          <div className="obras-report-select-icon obras-report-select-icon--cyan">
            <FiDroplet size={28} />
          </div>
          <h3 className="obras-report-select-title obras-report-select-title--cyan">
            RTH - Relatório de Teste Hidrostático
          </h3>
          <p className="obras-report-select-desc">
            Registro de testes hidrostáticos com parâmetros de pressão, horários,
            resultados, fotos, vídeos e aprovação.
          </p>
          <button
            className="obras-report-select-cta"
            type="button"
            onClick={() => setViewMode("reports-hydrostatic-new")}
          >
            Criar Registro
          </button>
        </div>

        <div className="obras-report-select-card">
          <div className="obras-report-select-icon obras-report-select-icon--violet">
            <FiFileText size={28} />
          </div>
          <h3 className="obras-report-select-title obras-report-select-title--violet">
            RCO - Relatório de Conclusão de Obra
          </h3>
          <p className="obras-report-select-desc">
            Relatório final de conclusão com atividades, ocorrências, comentários,
            fotos, vídeos e assinaturas múltiplas.
          </p>
          <button
            className="obras-report-select-cta"
            type="button"
            onClick={() => setViewMode("reports-completion-new")}
          >
            Criar Registro
          </button>
        </div>
      </div>
    </div>
  );
}

