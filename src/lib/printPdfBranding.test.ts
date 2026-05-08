import { describe, expect, it } from "vitest";
import { escapeHtml } from "./printPdfBranding";

describe("escapeHtml", () => {
  it("escapa caracteres especiais", () => {
    expect(escapeHtml(`a<b>"c"`)).toBe("a&lt;b&gt;&quot;c&quot;");
  });
});
