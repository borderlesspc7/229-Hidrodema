import { jsPDF } from "jspdf";
import type { ObraReport, Photo, Project } from "../types/obrasGerenciamentoModule";

/** Paleta alinhada à identidade da app (botões primários / texto). */
const PDF = {
  primary: [26, 58, 82] as [number, number, number],
  primaryMid: [44, 95, 122] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  surface: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  margin: 40,
  headerH: 78,
  footerReserve: 52,
  lineH: 15,
  sectionGap: 10,
  maxImageHeight: 220,
} as const;

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

function imageFormatFromDataUrl(url: string): "JPEG" | "PNG" | "WEBP" {
  const u = url.slice(0, 40).toLowerCase();
  if (u.includes("image/jpeg") || u.includes("image/jpg")) return "JPEG";
  if (u.includes("image/webp")) return "WEBP";
  return "PNG";
}

async function resolvePhotoDataUrlForPdf(photo: Photo): Promise<string | null> {
  if (photo.dataUrl?.startsWith("data:")) return photo.dataUrl;
  if (photo.storageUrl?.startsWith("http")) {
    try {
      const res = await fetch(photo.storageUrl, { mode: "cors" });
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = () => reject(fr.error);
        fr.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }
  return null;
}

export async function exportObraReportToPdf(
  report: ObraReport,
  project?: Project
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF.margin;
  const maxWidth = pageWidth - margin * 2;
  const contentBottom = () => pageHeight - PDF.footerReserve;
  const contentTop = () => margin + PDF.headerH + 16;

  const brand = "HIDRODEMA";
  const docTitle = `${formatType(report.type)}`;
  const subtitle = project?.name ?? "Obra";

  const drawHeader = () => {
    doc.setFillColor(...PDF.primary);
    doc.rect(0, 0, pageWidth, PDF.headerH, "F");
    doc.setFillColor(...PDF.primaryMid);
    doc.triangle(pageWidth * 0.55, 0, pageWidth, 0, pageWidth, PDF.headerH * 0.45, "F");

    doc.setTextColor(...PDF.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(brand, margin, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(docTitle, margin, 48);
    doc.setFontSize(10);
    doc.setTextColor(226, 232, 240);
    doc.text(subtitle, margin, 64);

    doc.setDrawColor(...PDF.border);
    doc.setTextColor(...PDF.text);
    doc.line(margin, PDF.headerH + 4, pageWidth - margin, PDF.headerH + 4);
  };

  const drawFooter = (page: number, total: number) => {
    const yLine = pageHeight - PDF.footerReserve + 8;
    doc.setDrawColor(...PDF.border);
    doc.line(margin, yLine, pageWidth - margin, yLine);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF.muted);
    const left = report.reportNumber
      ? `${brand} · ${report.reportNumber}`
      : `${brand} · ${docTitle}`;
    doc.text(left, margin, pageHeight - 18);

    doc.text(
      `Página ${page} de ${total}`,
      pageWidth - margin,
      pageHeight - 18,
      { align: "right" }
    );
    doc.setTextColor(...PDF.text);
  };

  let y = contentTop();

  const addPage = () => {
    doc.addPage();
    drawHeader();
    y = contentTop();
  };

  /** Garante altura vertical antes de desenhar um bloco (evita cortar no rodapé). */
  const ensureSpace = (neededPt: number) => {
    if (y + neededPt > contentBottom()) {
      addPage();
    }
  };

  const writeLines = (lines: string[], fontSize = 10) => {
    doc.setFontSize(fontSize);
    for (const ln of lines) {
      ensureSpace(PDF.lineH);
      doc.text(ln, margin, y);
      y += PDF.lineH;
    }
  };

  const addSection = (label: string, value: string) => {
    if (!value?.trim()) return;

    const lines = wrapLines(doc, value, maxWidth);
    const blockH =
      PDF.lineH + PDF.sectionGap + lines.length * PDF.lineH + 8;

    ensureSpace(blockH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...PDF.primary);
    doc.text(label.toUpperCase(), margin, y);
    y += PDF.lineH;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...PDF.text);
    writeLines(lines, 10);
    y += 6;
  };

  const addMetaBlock = () => {
    const metaLines: string[] = [
      report.reportNumber ? `Nº do relatório: ${report.reportNumber}` : "",
      `Data do relatório: ${new Date(report.date).toLocaleDateString("pt-BR")}`,
      project?.client ? `Cliente: ${project.client}` : "",
      `Emitido em: ${new Date().toLocaleString("pt-BR")}`,
    ].filter(Boolean);

    const pad = 12;
    const titleH = 16;
    const bodyH = metaLines.length * PDF.lineH;
    const boxH = pad + titleH + bodyH + pad;
    ensureSpace(boxH + 14);

    const top = y;
    doc.setFillColor(...PDF.surface);
    doc.setDrawColor(...PDF.border);
    doc.roundedRect(margin, top, maxWidth, boxH, 3, 3, "FD");

    let ty = top + pad + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...PDF.primary);
    doc.text("DADOS DA OBRA", margin + pad, ty);

    ty += titleH - 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...PDF.text);
    for (const ln of metaLines) {
      doc.text(ln, margin + pad, ty);
      ty += PDF.lineH;
    }
    y = top + boxH + 12;
  };

  const addTableRow = (label: string, value: string) => {
    if (!value?.trim()) return;
    const lines = wrapLines(doc, value, maxWidth - 120);
    const rowH = Math.max(PDF.lineH, lines.length * PDF.lineH);
    ensureSpace(rowH + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF.muted);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...PDF.text);
    let yRow = y;
    for (const ln of lines) {
      doc.text(ln, margin + 110, yRow);
      yRow += PDF.lineH;
    }
    y = Math.max(y + rowH, yRow) + 4;
  };

  const addPhotos = async () => {
    if (report.type !== "rdo" || !report.photos?.length) return;

    const resolved: { photo: Photo; dataUrl: string }[] = [];
    for (const photo of report.photos) {
      const dataUrl = await resolvePhotoDataUrlForPdf(photo);
      if (dataUrl) resolved.push({ photo, dataUrl });
    }
    if (!resolved.length) return;

    const titleH = PDF.lineH + PDF.sectionGap + 8;
    ensureSpace(titleH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...PDF.primary);
    doc.text("REGISTO FOTOGRÁFICO", margin, y);
    y += PDF.lineH + 8;

    for (const { photo, dataUrl } of resolved) {
      try {
        const fmt = imageFormatFromDataUrl(dataUrl);
        const props = doc.getImageProperties(dataUrl);
        const iw = props.width || 1;
        const ih = props.height || 1;
        const maxW = maxWidth;
        const scale = Math.min(maxW / iw, PDF.maxImageHeight / ih);
        const w = iw * scale;
        const h = ih * scale;
        const caption = photo.name || photo.description || "Anexo";
        const capLines = wrapLines(doc, caption, maxWidth);
        const blockH = h + 8 + capLines.length * PDF.lineH + 16;

        ensureSpace(blockH);

        doc.addImage(dataUrl, fmt, margin, y, w, h);
        y += h + 6;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(...PDF.muted);
        for (const cl of capLines) {
          doc.text(cl, margin, y);
          y += PDF.lineH - 2;
        }
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...PDF.text);
        y += 10;
      } catch {
        ensureSpace(PDF.lineH * 2);
        doc.setFontSize(9);
        doc.setTextColor(...PDF.muted);
        doc.text(`(Imagem não pôde ser incluída: ${photo.name ?? "anexo"})`, margin, y);
        y += PDF.lineH + 8;
        doc.setTextColor(...PDF.text);
      }
    }
  };

  drawHeader();
  y = contentTop();

  addMetaBlock();

  if (report.type === "rdo") {
    addSection("Atividades", report.activities);
    addSection("Observações", report.observations);
    if (report.weather) addSection("Clima", report.weather);
    if (report.responsible) addSection("Responsável", report.responsible);
    if (report.team?.length) addSection("Equipe", report.team.join(", "));
    await addPhotos();
  }

  if (report.type === "expense") {
    addTableRow("Categoria", report.category);
    addTableRow("Descrição", report.description);
    addTableRow("Valor", `R$ ${report.amount.toLocaleString("pt-BR")}`);
    addSection("Observações", report.notes);
  }

  if (report.type === "hydrostatic-test") {
    addTableRow("Pressão", String(report.pressure));
    addTableRow("Duração (min)", String(report.durationMinutes));
    addTableRow("Resultado", report.result);
    addSection("Observações", report.notes);
  }

  if (report.type === "project-completion") {
    addTableRow("Status final", report.finalStatus);
    addSection("Resumo", report.summary);
    addSection("Pendências", report.pendingItems);
  }

  const fileName = `relatorio-${formatType(report.type)
    .toLowerCase()
    .replaceAll(" ", "-")}-${(project?.name ?? "obra")
    .toLowerCase()
    .replaceAll(" ", "-")}-${report.date}.pdf`;

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(p, totalPages);
  }

  doc.save(fileName);
}
