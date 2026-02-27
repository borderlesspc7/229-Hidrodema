import { jsPDF } from "jspdf";
import type { DiaryEntry, ReportType } from "../services/obrasService";

const MARGIN = 20;
const LINE_HEIGHT = 5;
const TITLE_SIZE = 14;
const SECTION_SIZE = 11;
const BODY_SIZE = 9;
const FOOTER_MARGIN = 15;

function getReportTypeLabel(type: ReportType): string {
  switch (type) {
    case "rdo":
      return "RDO - Relatório Diário de Obra";
    case "lancamento-gastos":
      return "Lançamento de Gastos";
    case "teste-hidrostatico":
      return "RTH - Relatório de Teste Hidrostático";
    case "conclusao-obra":
      return "RCO - Relatório de Conclusão de Obra";
    default:
      return "Relatório de Obra";
  }
}

function addLine(
  doc: jsPDF,
  text: string,
  y: number,
  maxWidth: number
): number {
  const lines = doc.splitTextToSize(text || "—", maxWidth);
  doc.text(lines, MARGIN, y);
  return y + lines.length * LINE_HEIGHT;
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(SECTION_SIZE);
  doc.setFont("helvetica", "bold");
  doc.text(title, MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);
  return y + LINE_HEIGHT * 1.2;
}

function checkNewPage(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.height;
  if (y + needed > pageHeight - FOOTER_MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

export function generateDiarioObraPdf(
  entry: DiaryEntry,
  _options?: { logoUrl?: string }
): void {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.width;
  const maxWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  // Cabeçalho institucional
  doc.setFontSize(TITLE_SIZE);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text(getReportTypeLabel(entry.reportType), MARGIN, y);
  y += LINE_HEIGHT;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(0, 0, 0);
  doc.text(entry.obraName, MARGIN, y);
  y += LINE_HEIGHT;
  doc.text(
    `Data: ${new Date(entry.date).toLocaleDateString("pt-BR")}${entry.reportNumber ? `  |  Nº ${entry.reportNumber}` : ""}`,
    MARGIN,
    y
  );
  y += LINE_HEIGHT * 1.5;

  // Bloco comum: responsável, clima, atividades, observações
  y = addSectionTitle(doc, "Informações gerais", y);
  y = addLine(
    doc,
    `Responsável: ${entry.responsible || "Não informado"}`,
    y,
    maxWidth
  );
  y = addLine(
    doc,
    `Clima: ${entry.weather || "Não informado"}`,
    y,
    maxWidth
  );
  y = addLine(doc, `Status: ${entry.approvalStatus}`, y, maxWidth);
  y += LINE_HEIGHT;

  y = addSectionTitle(doc, "Atividades", y);
  y = addLine(doc, entry.activities || "—", y, maxWidth);
  y += LINE_HEIGHT;

  y = addSectionTitle(doc, "Observações", y);
  y = addLine(doc, entry.observations || "Nenhuma observação.", y, maxWidth);
  y += LINE_HEIGHT;

  // RDO: horário, mão de obra, equipamentos
  if (entry.reportType === "rdo") {
    if (entry.workSchedule) {
      y = checkNewPage(doc, y, LINE_HEIGHT * 6);
      y = addSectionTitle(doc, "Horário de trabalho", y);
      y = addLine(
        doc,
        `Entrada: ${entry.workSchedule.entryTime}  |  Saída: ${entry.workSchedule.exitTime}  |  Intervalo: ${entry.workSchedule.breakStart} - ${entry.workSchedule.breakEnd}  |  Total: ${entry.workSchedule.totalHours || "—"}`,
        y,
        maxWidth
      );
      y += LINE_HEIGHT;
    }
    if (entry.workforce && entry.workforce.length > 0) {
      y = checkNewPage(doc, y, LINE_HEIGHT * (entry.workforce.length + 2));
      y = addSectionTitle(doc, "Mão de obra", y);
      for (const w of entry.workforce) {
        y = addLine(
          doc,
          `• ${w.name} – ${w.company} (Qtd: ${w.quantity})`,
          y,
          maxWidth
        );
      }
      y += LINE_HEIGHT;
    }
    if (entry.equipmentUsed && entry.equipmentUsed.length > 0) {
      y = checkNewPage(doc, y, LINE_HEIGHT * (entry.equipmentUsed.length + 2));
      y = addSectionTitle(doc, "Equipamentos utilizados", y);
      for (const e of entry.equipmentUsed) {
        y = addLine(
          doc,
          `• ${e.name} ${e.code ? `(${e.code})` : ""} – Qtd: ${e.quantity}`,
          y,
          maxWidth
        );
      }
      y += LINE_HEIGHT;
    }
    if (entry.activitiesList && entry.activitiesList.length > 0) {
      y = checkNewPage(doc, y, LINE_HEIGHT * (entry.activitiesList.length + 2));
      y = addSectionTitle(doc, "Atividades detalhadas", y);
      for (const a of entry.activitiesList) {
        y = addLine(
          doc,
          `• ${a.description} – ${a.progress}% (${a.status})`,
          y,
          maxWidth
        );
      }
      y += LINE_HEIGHT;
    }
  }

  // Lançamento de gastos
  if (entry.reportType === "lancamento-gastos" && entry.expenses && entry.expenses.length > 0) {
    y = checkNewPage(doc, y, LINE_HEIGHT * (entry.expenses.length + 2));
    y = addSectionTitle(doc, "Gastos lançados", y);
    let totalExp = 0;
    for (const ex of entry.expenses) {
      const val = ex.value || 0;
      totalExp += val;
      y = addLine(
        doc,
        `• ${ex.description} – R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${ex.category})`,
        y,
        maxWidth
      );
    }
    y = addLine(
      doc,
      `Total: R$ ${totalExp.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      y,
      maxWidth
    );
    y += LINE_HEIGHT;
  }

  // Teste hidrostático
  if (entry.reportType === "teste-hidrostatico" && entry.testItems && entry.testItems.length > 0) {
    y = checkNewPage(doc, y, LINE_HEIGHT * 4);
    y = addSectionTitle(doc, "Itens testados", y);
    for (const item of entry.testItems) {
      y = addLine(doc, `• ${item.itemName} – ${item.result}`, y, maxWidth);
      if (item.notes) y = addLine(doc, `  ${item.notes}`, y, maxWidth - 5);
    }
    y += LINE_HEIGHT;
  }

  // Conclusão de obra: atividades e assinaturas
  if (entry.reportType === "conclusao-obra") {
    if (entry.conclusionActivities && entry.conclusionActivities.length > 0) {
      y = checkNewPage(doc, y, LINE_HEIGHT * (entry.conclusionActivities.length + 2));
      y = addSectionTitle(doc, "Atividades de conclusão", y);
      for (const a of entry.conclusionActivities) {
        y = addLine(
          doc,
          `• ${a.description} – ${a.progress}% (${a.status})`,
          y,
          maxWidth
        );
      }
      y += LINE_HEIGHT;
    }
  }

  // Materiais
  if (entry.materials && entry.materials.length > 0) {
    y = checkNewPage(doc, y, LINE_HEIGHT * (entry.materials.length + 2));
    y = addSectionTitle(doc, "Materiais", y);
    for (const m of entry.materials) {
      y = addLine(
        doc,
        `• ${m.name} – ${m.quantity} ${m.unit}`,
        y,
        maxWidth
      );
    }
    y += LINE_HEIGHT;
  }

  // Anexos (PDF/arquivos)
  if (entry.attachments && entry.attachments.length > 0) {
    y = checkNewPage(doc, y, LINE_HEIGHT * (entry.attachments.length + 2));
    y = addSectionTitle(doc, "Anexos (documentos)", y);
    for (const a of entry.attachments) {
      y = addLine(doc, `• ${a.name}`, y, maxWidth);
    }
    y += LINE_HEIGHT;
  }

  // Fotos (apenas indicação de quantidade)
  if (entry.photos && entry.photos.length > 0) {
    y = checkNewPage(doc, y, LINE_HEIGHT * 2);
    y = addSectionTitle(doc, "Fotos", y);
    y = addLine(doc, `${entry.photos.length} foto(s) anexada(s).`, y, maxWidth);
    y += LINE_HEIGHT;
  }

  // Assinatura(s)
  if (entry.signature || (entry.signatures && entry.signatures.length > 0)) {
    y = checkNewPage(doc, y, LINE_HEIGHT * 4);
    y = addSectionTitle(doc, "Assinatura(s)", y);
    if (entry.signature) {
      y = addLine(doc, "Assinatura registrada.", y, maxWidth);
      if (entry.signedBy) y = addLine(doc, `Assinado por: ${entry.signedBy}`, y, maxWidth);
      if (entry.signedAt) y = addLine(doc, `Em: ${entry.signedAt}`, y, maxWidth);
    }
    if (entry.signatures && entry.signatures.length > 0) {
      for (const sig of entry.signatures) {
        y = addLine(
          doc,
          `• ${sig.name} (${sig.company}) – ${sig.role}${sig.signedAt ? ` – ${sig.signedAt}` : ""}`,
          y,
          maxWidth
        );
      }
    }
  }

  const typeSlug =
    entry.reportType === "rdo"
      ? "RDO"
      : entry.reportType === "lancamento-gastos"
        ? "Gastos"
        : entry.reportType === "teste-hidrostatico"
          ? "RTH"
          : "RCO";
  const safeName = (entry.obraName || "Obra").replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, "").slice(0, 40);
  const dateStr = new Date(entry.date).toISOString().slice(0, 10);
  doc.save(`${typeSlug}_${safeName}_${dateStr}.pdf`);
}
