import type { ObraReportType } from "../types/obrasGerenciamentoModule";

/** Prefixos fixos por tipo — facilitam busca e arquivo (ex.: RDO-, DESP-). */
export function formatReportPrefix(type: ObraReportType): string {
  switch (type) {
    case "rdo":
      return "RDO";
    case "expense":
      return "DESP";
    case "hydrostatic-test":
      return "HIDRO";
    case "project-completion":
      return "CONC";
    default:
      return "REL";
  }
}

export function padNumber(n: number, width: number): string {
  const s = String(Math.max(0, Math.trunc(n)));
  return s.length >= width ? s : "0".repeat(width - s.length) + s;
}

/** Formato: PREFIXO-AAAAMMDD-NNNNN (NNNNN sequencial por tipo). */
export function buildReportNumber(
  type: ObraReportType,
  dateYyyyMmDd: string,
  seq: number
): string {
  const ymd = String(dateYyyyMmDd || "").replaceAll("-", "");
  const prefix = formatReportPrefix(type);
  return `${prefix}-${ymd}-${padNumber(seq, 5)}`;
}

export const REPORT_COUNTER_TYPES: ObraReportType[] = [
  "rdo",
  "expense",
  "hydrostatic-test",
  "project-completion",
];
