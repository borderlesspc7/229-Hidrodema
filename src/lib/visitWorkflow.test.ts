import { describe, expect, it } from "vitest";
import {
  getSuggestedNextStepsForVisit,
  getSuggestedNextStepsForVisitWorkflow,
} from "./visitWorkflow";

describe("getSuggestedNextStepsForVisit", () => {
  it("pendente sugere confirmação com cliente", () => {
    const steps = getSuggestedNextStepsForVisit({
      status: "pending",
      hasReport: false,
    });
    expect(steps.some((s) => s.includes("Confirmar data"))).toBe(true);
  });

  it("com relatório sugere arquivo", () => {
    const steps = getSuggestedNextStepsForVisit({
      status: "scheduled",
      hasReport: true,
    });
    expect(steps.some((s) => s.includes("Arquivar PDF"))).toBe(true);
  });
});

describe("getSuggestedNextStepsForVisitWorkflow", () => {
  it("linha de relatório histórico sugere arquivo", () => {
    const steps = getSuggestedNextStepsForVisitWorkflow({
      status: "completed",
      hasReport: true,
      isRequest: false,
    });
    expect(steps).toHaveLength(1);
    expect(steps[0]).toContain("Arquivar");
  });

  it("cancelada sugere nova solicitação", () => {
    const steps = getSuggestedNextStepsForVisitWorkflow({
      status: "cancelled",
      hasReport: false,
      isRequest: true,
    });
    expect(steps.some((s) => s.includes("nova solicitação"))).toBe(true);
  });

  it("aguardando relatório sugere preencher relatório", () => {
    const steps = getSuggestedNextStepsForVisitWorkflow({
      status: "awaiting-report",
      hasReport: false,
      isRequest: true,
    });
    expect(steps.some((s) => s.includes("relatório"))).toBe(true);
  });
});
