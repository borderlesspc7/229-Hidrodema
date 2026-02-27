import { jsPDF } from "jspdf";
import type {
  Project,
  DiaryEntry,
  TeamMember,
  Equipment,
  InventoryItem,
  Supplier,
  DocumentRecord,
} from "../services/obrasService";

const MARGIN = 20;
const LINE_HEIGHT = 6;
const TITLE_SIZE = 14;
const BODY_SIZE = 9;

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(TITLE_SIZE);
  doc.setFont("helvetica", "bold");
  doc.text(title, MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);
  return y + LINE_HEIGHT * 1.5;
}

function addLine(doc: jsPDF, text: string, y: number, maxWidth: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, MARGIN, y);
  return y + lines.length * LINE_HEIGHT;
}

function addKeyValue(
  doc: jsPDF,
  label: string,
  value: string | number,
  y: number,
  maxWidth: number
): number {
  return addLine(doc, `${label}: ${value}`, y, maxWidth);
}

function checkNewPage(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.height;
  if (y + needed > pageHeight - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

export function generateObraConsolidatedPdf(
  project: Project,
  team: TeamMember[],
  equipment: Equipment[],
  inventory: InventoryItem[],
  suppliers: Supplier[],
  reports: DiaryEntry[],
  documents: DocumentRecord[]
): void {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.width;
  const maxWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  // Capa / Dados da obra
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO CONSOLIDADO DA OBRA", MARGIN, y);
  y += LINE_HEIGHT * 2;
  doc.setFontSize(BODY_SIZE);
  doc.setFont("helvetica", "normal");

  y = addKeyValue(doc, "Obra", project.name, y, maxWidth);
  y = addKeyValue(doc, "Cliente", project.client, y, maxWidth);
  y = addKeyValue(
    doc,
    "Status",
    project.status === "planejamento"
      ? "Planejamento"
      : project.status === "em-andamento"
        ? "Em andamento"
        : project.status === "concluida"
          ? "Concluída"
          : "Pausada",
    y,
    maxWidth
  );
  y = addKeyValue(
    doc,
    "Início",
    new Date(project.startDate).toLocaleDateString("pt-BR"),
    y,
    maxWidth
  );
  y = addKeyValue(
    doc,
    "Término previsto",
    new Date(project.endDate).toLocaleDateString("pt-BR"),
    y,
    maxWidth
  );
  y = addKeyValue(
    doc,
    "Orçamento",
    `R$ ${project.budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    y,
    maxWidth
  );
  y = addKeyValue(
    doc,
    "Gasto",
    `R$ ${project.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    y,
    maxWidth
  );
  y = addKeyValue(doc, "Progresso", `${project.progress}%`, y, maxWidth);
  if (project.description) {
    y = checkNewPage(doc, y, LINE_HEIGHT * 3);
    y = addLine(doc, `Descrição: ${project.description}`, y, maxWidth);
  }
  y += LINE_HEIGHT;

  // Equipe
  y = checkNewPage(doc, y, LINE_HEIGHT * 4);
  y = addSectionTitle(doc, "Equipe", y);
  if (team.length === 0) {
    y = addLine(doc, "Nenhum membro alocado.", y, maxWidth);
  } else {
    for (const m of team) {
      y = checkNewPage(doc, y, LINE_HEIGHT * 2);
      y = addLine(doc, `• ${m.name} – ${m.role}`, y, maxWidth);
    }
  }
  y += LINE_HEIGHT;

  // Equipamentos
  y = checkNewPage(doc, y, LINE_HEIGHT * 4);
  y = addSectionTitle(doc, "Equipamentos", y);
  if (equipment.length === 0) {
    y = addLine(doc, "Nenhum equipamento alocado.", y, maxWidth);
  } else {
    for (const e of equipment) {
      y = checkNewPage(doc, y, LINE_HEIGHT * 2);
      y = addLine(
        doc,
        `• ${e.name} (${e.type}) – ${e.status === "disponivel" ? "Disponível" : e.status === "em-uso" ? "Em uso" : e.status === "manutencao" ? "Manutenção" : "Quebrado"}`,
        y,
        maxWidth
      );
    }
  }
  y += LINE_HEIGHT;

  // Estoque
  y = checkNewPage(doc, y, LINE_HEIGHT * 4);
  y = addSectionTitle(doc, "Estoque", y);
  if (inventory.length === 0) {
    y = addLine(doc, "Nenhum item vinculado.", y, maxWidth);
  } else {
    for (const item of inventory) {
      y = checkNewPage(doc, y, LINE_HEIGHT * 2);
      y = addLine(
        doc,
        `• ${item.name} – ${item.quantity} ${item.unit} (${item.category})`,
        y,
        maxWidth
      );
    }
  }
  y += LINE_HEIGHT;

  // Fornecedores
  y = checkNewPage(doc, y, LINE_HEIGHT * 4);
  y = addSectionTitle(doc, "Fornecedores", y);
  if (suppliers.length === 0) {
    y = addLine(doc, "Nenhum fornecedor vinculado.", y, maxWidth);
  } else {
    for (const s of suppliers) {
      y = checkNewPage(doc, y, LINE_HEIGHT * 2);
      y = addLine(doc, `• ${s.name} – ${s.category}`, y, maxWidth);
    }
  }
  y += LINE_HEIGHT;

  // Relatórios
  y = checkNewPage(doc, y, LINE_HEIGHT * 4);
  y = addSectionTitle(doc, "Relatórios", y);
  if (reports.length === 0) {
    y = addLine(doc, "Nenhum relatório registrado.", y, maxWidth);
  } else {
    for (const r of reports) {
      y = checkNewPage(doc, y, LINE_HEIGHT * 3);
      const typeLabel =
        r.reportType === "rdo"
          ? "RDO"
          : r.reportType === "lancamento-gastos"
            ? "Gastos"
            : r.reportType === "teste-hidrostatico"
              ? "Teste Hidrostático"
              : "Conclusão";
      y = addLine(
        doc,
        `• ${new Date(r.date).toLocaleDateString("pt-BR")} – ${typeLabel}${r.reportNumber ? ` #${r.reportNumber}` : ""}`,
        y,
        maxWidth
      );
      if (r.activities) {
        const sub = r.activities.slice(0, 80) + (r.activities.length > 80 ? "..." : "");
        y = addLine(doc, `  ${sub}`, y, maxWidth - 5);
      }
    }
  }
  y += LINE_HEIGHT;

  // Anexos / Documentos
  y = checkNewPage(doc, y, LINE_HEIGHT * 4);
  y = addSectionTitle(doc, "Anexos / Documentos", y);
  if (documents.length === 0) {
    y = addLine(doc, "Nenhum documento anexado.", y, maxWidth);
  } else {
    for (const d of documents) {
      y = checkNewPage(doc, y, LINE_HEIGHT * 2);
      y = addLine(
        doc,
        `• ${d.name} (${d.type}) – ${new Date(d.uploadDate).toLocaleDateString("pt-BR")}`,
        y,
        maxWidth
      );
    }
  }

  const safeName = project.name.replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, "").slice(0, 50);
  doc.save(`Obra_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
