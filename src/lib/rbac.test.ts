import { describe, expect, it } from "vitest";
import {
  filterVisitRequestsForUser,
  hasMacroVisibility,
  userOwnsVisitRow,
} from "./rbac";
import type { User } from "../types/user";
import type { VisitRequest } from "../services/visitasService";

const baseUser = (): User => ({
  uid: "u1",
  name: "João Silva",
  email: "joao@empresa.com",
  createdAt: new Date(),
  updatedAt: new Date(),
  role: "vendedor",
  sellerCode: "002620",
});

describe("hasMacroVisibility", () => {
  it("gestor e admin veem macro", () => {
    expect(
      hasMacroVisibility({
        ...baseUser(),
        role: "gestor",
      })
    ).toBe(true);
    expect(
      hasMacroVisibility({
        ...baseUser(),
        role: "admin",
      })
    ).toBe(true);
  });

  it("vendedor não tem visão macro", () => {
    expect(hasMacroVisibility({ ...baseUser(), role: "vendedor" })).toBe(
      false
    );
  });
});

describe("userOwnsVisitRow", () => {
  it("criador do documento sempre possui", () => {
    const row = {
      createdBy: "u1",
    } as VisitRequest;
    expect(userOwnsVisitRow(baseUser(), row)).toBe(true);
  });

  it("código de vendedor no campo agregado", () => {
    const row = {
      vendedor: "002620 - NOME EXEMPLO",
    } as VisitRequest;
    expect(userOwnsVisitRow(baseUser(), row)).toBe(true);
  });
});

describe("filterVisitRequestsForUser", () => {
  it("macro retorna todos", () => {
    const rows = [{ id: "a" }, { id: "b" }] as VisitRequest[];
    expect(
      filterVisitRequestsForUser(
        { ...baseUser(), role: "gestor" },
        rows
      ).length
    ).toBe(2);
  });
});
