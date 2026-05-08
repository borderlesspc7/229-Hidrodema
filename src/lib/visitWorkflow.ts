import type { VisitRequest } from "../services/visitasService";

/** Estados usados na planilha (UI) além dos guardados em `VisitRequest`. */
export type VisitWorkflowUiStatus =
  | VisitRequest["status"]
  | "awaiting-report";

export type VisitWorkflowInput = {
  status: VisitWorkflowUiStatus;
  hasReport: boolean;
  /** `false` quando a linha é um relatório já criado (histórico). */
  isRequest: boolean;
};

/** Próximos passos sugeridos no fluxo solicitação → relatório (UX / automação leve). */
export function getSuggestedNextStepsForVisit(
  req: Pick<VisitRequest, "status" | "hasReport">
): string[] {
  return getSuggestedNextStepsForVisitWorkflow({
    status: req.status,
    hasReport: req.hasReport,
    isRequest: true,
  });
}

/** Versão completa para a planilha / histórico (inclui `awaiting-report` e linhas de relatório). */
export function getSuggestedNextStepsForVisitWorkflow(
  input: VisitWorkflowInput
): string[] {
  const steps: string[] = [];
  const { status, hasReport, isRequest } = input;

  if (!isRequest) {
    steps.push("Arquivar PDF e acompanhar follow-up se houver.");
    return steps;
  }

  if (status === "cancelled") {
    steps.push("Se necessário, abrir nova solicitação de visita.");
    return steps;
  }

  if (status === "pending") {
    steps.push("Confirmar data e período com o cliente.");
    steps.push("Atualizar o status para “Agendada” após confirmação.");
  }

  const awaitingReport =
    status === "awaiting-report" || (status === "scheduled" && !hasReport);

  if (awaitingReport && !hasReport) {
    steps.push("Realizar a visita conforme agendamento (se ainda não realizada).");
    steps.push("Preencher o relatório de visita após o retorno de campo.");
  }

  if (status === "completed" && !hasReport) {
    steps.push("Conferir se o relatório foi registado; atualizar estado se necessário.");
  }

  if (hasReport) {
    steps.push("Arquivar PDF e acompanhar follow-up se houver.");
  }

  return steps;
}
