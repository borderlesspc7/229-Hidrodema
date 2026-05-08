import type {
  DiaryEntry,
  InventoryItem,
  ObraReport,
  Project,
  Supplier,
} from "../types/obrasGerenciamentoModule";
import { buildHidrodemaPrintDocument, escapeHtml } from "./printPdfBranding";

export function generateObraConsolidatedPdf(params: {
  project: Project;
  diaries: DiaryEntry[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  reports: ObraReport[];
}): string {
  const { project, diaries, inventory, suppliers, reports } = params;

  const money = (v: number) => `R$ ${Number(v ?? 0).toLocaleString("pt-BR")}`;
  const datePt = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "-";

  const invValue = inventory.reduce((acc, i) => acc + (i.quantity ?? 0) * (i.price ?? 0), 0);
  const lowStock = inventory.filter((i) => (i.quantity ?? 0) <= (i.minStock ?? 0)).length;

  const section = (title: string, body: string) => `
    <section class="print-section">
      <h3>${escapeHtml(title)}</h3>
      ${body}
    </section>
  `;

  const kv = (label: string, value: string) => `
    <div class="print-question">
      <span class="print-label">${escapeHtml(label)}:</span>
      <span class="print-value">${escapeHtml(value || "-")}</span>
    </div>
  `;

  const inventoryTable =
    inventory.length === 0
      ? `<div class="print-question"><span class="print-value">Nenhum item de estoque vinculado.</span></div>`
      : `
        <table class="print-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Categoria</th>
              <th>Qtd</th>
              <th>Mín</th>
              <th>Preço</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${inventory
              .slice()
              .sort((a, b) => String(a.name).localeCompare(String(b.name)))
              .map((i) => {
                const subtotal = (i.quantity ?? 0) * (i.price ?? 0);
                return `<tr>
                  <td>${escapeHtml(i.name)}</td>
                  <td>${escapeHtml(i.category)}</td>
                  <td>${escapeHtml(`${i.quantity} ${i.unit}`)}</td>
                  <td>${escapeHtml(String(i.minStock ?? 0))}</td>
                  <td>${escapeHtml(money(i.price ?? 0))}</td>
                  <td>${escapeHtml(money(subtotal))}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      `;

  const suppliersList =
    suppliers.length === 0
      ? `<div class="print-question"><span class="print-value">Nenhum fornecedor vinculado.</span></div>`
      : `
        <table class="print-table">
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>Contato</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Categoria</th>
            </tr>
          </thead>
          <tbody>
            ${suppliers
              .slice()
              .sort((a, b) => String(a.name).localeCompare(String(b.name)))
              .map((s) => `<tr>
                <td>${escapeHtml(s.name)}</td>
                <td>${escapeHtml(s.contact)}</td>
                <td>${escapeHtml(s.email)}</td>
                <td>${escapeHtml(s.phone)}</td>
                <td>${escapeHtml(s.category)}</td>
              </tr>`)
              .join("")}
          </tbody>
        </table>
      `;

  const reportsList =
    reports.length === 0
      ? `<div class="print-question"><span class="print-value">Nenhum relatório vinculado.</span></div>`
      : `
        <table class="print-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Data</th>
              <th>Número</th>
              <th>Criado em</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${reports
              .slice()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((r) => `<tr>
                <td>${escapeHtml(r.type)}</td>
                <td>${escapeHtml(datePt(r.date))}</td>
                <td>${escapeHtml(r.reportNumber ?? "-")}</td>
                <td>${escapeHtml(new Date(r.createdAt).toLocaleString("pt-BR"))}</td>
                <td>${escapeHtml(r.finalizedAt ? "finalizado" : "rascunho")}</td>
              </tr>`)
              .join("")}
          </tbody>
        </table>
      `;

  const diariesSummary = `
    <div class="print-question"><span class="print-value">
      Total de registros: <strong>${escapeHtml(String(diaries.length))}</strong>
    </span></div>
  `;

  const bodyHtml = `
    ${section(
      "Resumo da Obra",
      [
        kv("Obra", project.name),
        kv("Cliente", project.client),
        kv("Status", project.status),
        kv("Início", datePt(project.startDate)),
        kv("Previsão", datePt(project.endDate)),
        kv("Progresso", `${project.progress ?? 0}%`),
        kv("Orçamento", money(project.budget ?? 0)),
        kv("Gasto", money(project.spent ?? 0)),
      ].join("")
    )}
    ${section("Diário de Obras", diariesSummary)}
    ${section(
      "Estoque",
      [
        kv("Itens", String(inventory.length)),
        kv("Alertas (baixo/crit.)", String(lowStock)),
        kv("Valor estimado", money(invValue)),
        inventoryTable,
      ].join("")
    )}
    ${section("Fornecedores", suppliersList)}
    ${section("Relatórios", reportsList)}
  `;

  return buildHidrodemaPrintDocument({
    pageTitle: `Obra ${project.name}`,
    mainTitle: "Relatório consolidado da obra",
    brandLine: "HIDRODEMA",
    subtitle: project.name,
    metaLinesHtml: `
      <p><span class="print-label">Cliente:</span><span class="print-value">${escapeHtml(
        project.client
      )}</span></p>
      <p><span class="print-label">Gerado para:</span><span class="print-value">Gestão da obra</span></p>
    `,
    bodyHtml,
    extraStyles: `
      .print-table { width: 100%; border-collapse: collapse; }
      .print-table th { background: #0f172a; color: #fff; padding: 8px; font-size: 12px; text-align: left; position: sticky; top: 0; }
      .print-table td { border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; vertical-align: top; }
    `,
  });
}

