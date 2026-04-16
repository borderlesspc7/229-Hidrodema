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

  const brand = "HIDRODEMA";
  const title = `${formatType(report.type)} - ${project?.name ?? "Obra"}`;

  const drawHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(brand, margin, 34);
    doc.setFontSize(12);
    doc.text(title, margin, 52);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 62, pageWidth - margin, 62);
  };

  const drawFooter = (page: number, total: number) => {
    const footerY = pageHeight - 24;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `Página ${page} de ${total}`,
      pageWidth - margin,
      footerY,
      { align: "right" }
    );
  };

  const addPage = () => {
    doc.addPage();
    drawHeader();
    y = 86;
  };

  drawHeader();
  y = 86;

  // Bloco: Dados da Obra
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DADOS DA OBRA", margin, y);
  y += lineH;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const metaLines = [
    report.reportNumber ? `Nº: ${report.reportNumber}` : "",
    `Data: ${new Date(report.date).toLocaleDateString()}`,
    project?.client ? `Cliente: ${project.client}` : "",
    `Gerado em: ${new Date().toLocaleString()}`,
  ].filter(Boolean);
  for (const ln of metaLines) {
    doc.text(ln, margin, y);
    y += lineH;
  }
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;

  const addSection = (label: string, value: string) => {
    if (!value?.trim()) return;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label, margin, y);
    y += lineH;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = wrapLines(doc, value, maxWidth);
    for (const ln of lines) {
      if (y > pageHeight - margin - 30) {
        addPage();
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

  // Footer com paginação
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(p, totalPages);
  }

  doc.save(fileName);
}

