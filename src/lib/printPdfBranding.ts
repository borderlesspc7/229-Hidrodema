/**
 * Estilos e estrutura comuns para impressão HTML → PDF (navegador).
 * Usado em relatórios de visita, MDS/Equalizador e outros exports semelhantes.
 */

export function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** CSS base partilhado (identidade azul HIDRODEMA). */
export const PRINT_PDF_BASE_STYLES = `
  body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #0f172a; }
  .print-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #1e40af; }
  .print-brand { font-size: 11px; letter-spacing: 3px; font-weight: 800; color: #1e40af; text-transform: uppercase; }
  .print-main-title { font-size: 20px; font-weight: 800; margin: 10px 0 4px; color: #0f172a; }
  .print-meta { margin-top: 12px; font-size: 14px; color: #334155; text-align: center; }
  .print-meta p { margin: 4px 0; }
  .print-footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
  .print-section { margin-bottom: 22px; }
  .print-section h3 { font-size: 15px; color: #1e40af; margin-bottom: 10px; }
  .print-question { margin-bottom: 14px; }
  .print-label { font-weight: bold; color: #1e40af; }
  .print-value { margin-left: 8px; }
  .print-comments { margin-top: 28px; }
  .print-comment { margin-bottom: 12px; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
  @media print { body { margin: 12mm; } }
`;

export function formatPrintFooterGeneratedAt(d = new Date()): string {
  return `Gerado em ${d.toLocaleString()} · HIDRODEMA`;
}

export function buildHidrodemaPrintDocument(params: {
  pageTitle: string;
  mainTitle: string;
  subtitle?: string;
  /** Linhas HTML já seguras (usar `escapeHtml` nos valores). */
  metaLinesHtml: string;
  bodyHtml: string;
  extraStyles?: string;
  brandLine?: string;
}): string {
  const brand = escapeHtml(params.brandLine ?? "HIDRODEMA");
  const sub = params.subtitle
    ? `<div class="print-meta">${escapeHtml(params.subtitle)}</div>`
    : "";
  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(params.pageTitle)}</title>
<style>${PRINT_PDF_BASE_STYLES}${params.extraStyles ?? ""}</style>
</head>
<body>
  <header class="print-header">
    <div class="print-brand">${brand}</div>
    <div class="print-main-title">${escapeHtml(params.mainTitle)}</div>
    ${sub}
    <div class="print-meta">${params.metaLinesHtml}</div>
  </header>
  ${params.bodyHtml}
  <footer class="print-footer">${formatPrintFooterGeneratedAt()}</footer>
</body>
</html>`;
}
