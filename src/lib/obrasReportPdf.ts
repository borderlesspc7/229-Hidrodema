import { jsPDF } from "jspdf";
import type { ObraReport, Project } from "../types/obrasGerenciamentoModule";

function wrapLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  const chunks = String(text ?? "").split("\n");
  const out: string[] = [];
  for (const c of chunks) {
    const lines = doc.splitTextToSize(c, maxWidth) as string[];
    if (lines.length === 0) out.push("");
    else out.push(...lines);
  }
  return out;
}

function formatType(type: ObraReport["type"]): string {
  switch (type) {
    case "rdo":
      return "RDO";
    case "expense":
      return "Despesa";
    case "hydrostatic-test":
      return "Teste Hidrostático";
    case "project-completion":
      return "Conclusão";
    default:
      return String(type);
  }
}

export function exportObraReportToPdf(report: ObraReport, project?: Project): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;

  let y = margin;
  const lineH = 16;

  const title = `${formatType(report.type)} - ${project?.name ?? "Obra"}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, margin, y);
  y += lineH + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Data: ${new Date(report.date).toLocaleDateString()}`, margin, y);
  y += lineH;
  if (project?.client) {
    doc.text(`Cliente: ${project.client}`, margin, y);
    y += lineH;
  }
  doc.text(`Gerado em: ${new Date().toLocaleString()}`, margin, y);
  y += lineH + 10;

  const addSection = (label: string, value: string) => {
    if (!value?.trim()) return;

    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    y += lineH;

    doc.setFont("helvetica", "normal");
    const lines = wrapLines(doc, value, maxWidth);
    for (const ln of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(ln, margin, y);
      y += lineH;
    }
    y += 8;
  };

  if (report.type === "rdo") {
    addSection("Atividades", report.activities);
    addSection("Observações", report.observations);
    if (report.weather) addSection("Clima", report.weather);
    if (report.responsible) addSection("Responsável", report.responsible);
    if (report.team?.length) addSection("Equipe", report.team.join(", "));
  }

  if (report.type === "expense") {
    addSection("Categoria", report.category);
    addSection("Descrição", report.description);
    addSection("Valor", `R$ ${report.amount.toLocaleString()}`);
    addSection("Observações", report.notes);
  }

  if (report.type === "hydrostatic-test") {
    addSection("Pressão", String(report.pressure));
    addSection("Duração (min)", String(report.durationMinutes));
    addSection("Resultado", report.result);
    addSection("Observações", report.notes);
  }

  if (report.type === "project-completion") {
    addSection("Status final", report.finalStatus);
    addSection("Resumo", report.summary);
    addSection("Pendências", report.pendingItems);
  }

  const fileName = `relatorio-${formatType(report.type)
    .toLowerCase()
    .replaceAll(" ", "-")}-${(project?.name ?? "obra")
    .toLowerCase()
    .replaceAll(" ", "-")}-${report.date}.pdf`;
  doc.save(fileName);
}

