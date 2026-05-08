import type { ObraReportType } from "../../../../types/obrasGerenciamentoModule";

type Props = {
  type: ObraReportType;
};

const LABELS: Record<ObraReportType, string> = {
  rdo: "RDO",
  expense: "Despesa",
  "hydrostatic-test": "Teste Hidrostático",
  "project-completion": "Conclusão",
};

export default function ReportTypeBadge({ type }: Props) {
  return (
    <span className={`obras-report-type obras-report-type--${type}`}>
      {LABELS[type]}
    </span>
  );
}

