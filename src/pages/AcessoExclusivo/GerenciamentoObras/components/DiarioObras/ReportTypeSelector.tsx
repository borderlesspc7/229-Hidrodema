import Card from "../../../../../components/ui/Card/Card";
import Button from "../../../../../components/ui/Button/Button";
import {
  FiFileText,
  FiDollarSign,
  FiDroplet,
  FiArrowLeft,
} from "react-icons/fi";
import type { ReportType } from "../../../../../services/obrasService";

interface ReportTypeSelectorProps {
  onSelectType: (type: ReportType) => void;
  onBack: () => void;
}

const reportTypes = [
  {
    type: "rdo" as ReportType,
    title: "RDO - Relatório Diário de Obra",
    description:
      "Registro completo do dia: horário de trabalho, mão de obra, equipamentos, atividades, ocorrências, fotos e aprovação.",
    icon: FiFileText,
    color: "#3b82f6",
    bgColor: "#eff6ff",
    available: true,
  },
  {
    type: "lancamento-gastos" as ReportType,
    title: "Lançamento de Gastos",
    description:
      "Registro de despesas e gastos da obra com comprovantes, valores e aprovação.",
    icon: FiDollarSign,
    color: "#10b981",
    bgColor: "#ecfdf5",
    available: true,
  },
  {
    type: "teste-hidrostatico" as ReportType,
    title: "RTH - Relatório de Teste Hidrostático",
    description:
      "Registro de testes hidrostáticos com parâmetros de pressão, horários, resultados, fotos, vídeos e aprovação.",
    icon: FiDroplet,
    color: "#0ea5e9",
    bgColor: "#e0f2fe",
    available: true,
  },
  {
    type: "conclusao-obra" as ReportType,
    title: "RCO - Relatório de Conclusão de Obra",
    description:
      "Relatório final de conclusão com atividades, ocorrências, comentários, fotos, vídeos e assinaturas múltiplas.",
    icon: FiFileText,
    color: "#8b5cf6",
    bgColor: "#f3e8ff",
    available: true,
  },
];

export default function ReportTypeSelector({
  onSelectType,
  onBack,
}: ReportTypeSelectorProps) {
  return (
    <div className="obras-report-selector-container">
      <Button variant="secondary" onClick={onBack} className="obras-back-btn">
        <FiArrowLeft size={16} />
        Voltar ao Menu
      </Button>

      <div className="obras-report-selector-header">
        <h2>SELECIONE O TIPO DE RELATÓRIO</h2>
        <p>Escolha o tipo de relatório que deseja criar</p>
      </div>

      <div className="obras-report-selector-grid">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card
              key={report.type}
              variant="service"
              title=""
              className={`obras-report-type-card ${
                !report.available ? "obras-report-type-disabled" : ""
              }`}
              onClick={() => report.available && onSelectType(report.type)}
            >
              <div className="obras-report-type-content">
                <div
                  className="obras-report-type-icon"
                  style={{
                    backgroundColor: report.bgColor,
                    color: report.color,
                  }}
                >
                  <IconComponent size={48} />
                </div>
                <h3 style={{ color: report.color }}>{report.title}</h3>
                <p>{report.description}</p>
                {report.available ? (
                  <Button
                    variant="primary"
                    onClick={() => onSelectType(report.type)}
                    className="obras-report-type-button"
                  >
                    Criar Relatório
                  </Button>
                ) : (
                  <span className="obras-coming-soon-badge">Em Breve</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
