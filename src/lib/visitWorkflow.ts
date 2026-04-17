import type { VisitRequest } from "../services/visitasService";

/** Próximos passos sugeridos no fluxo solicitação → relatório (UX / automação leve). */
export function getSuggestedNextStepsForVisit(
  req: Pick<VisitRequest, "status" | "hasReport">
): string[] {
  const steps: string[] = [];
  if (req.status === "pending") {
    steps.push("Confirmar data e período com o cliente.");
    steps.push("Atualizar o status para “Agendada” após confirmação.");
  }
  if (req.status === "scheduled" && !req.hasReport) {
    steps.push("Realizar a visita conforme agendamento.");
    steps.push("Preencher o relatório de visita após o retorno de campo.");
  }
  if (req.hasReport) {
    steps.push("Arquivar PDF e acompanhar follow-up se houver.");
  }
  return steps;
}
