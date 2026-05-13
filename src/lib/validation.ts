export type ValidationResult<T> =
  | { ok: true; value: T; warnings?: string[] }
  | { ok: false; errors: string[]; warnings?: string[] };

function isOk<T>(r: ValidationResult<T>): r is { ok: true; value: T; warnings?: string[] } {
  return r.ok;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return (
    typeof v === "object" &&
    v !== null &&
    (Object.getPrototypeOf(v) === Object.prototype ||
      Object.getPrototypeOf(v) === null)
  );
}

export function sanitizeForDatabase<T>(input: T): T {
  if (input === null || input === undefined) return input;

  if (typeof input === "string") {
    // remove potentially dangerous angle brackets; keep rest intact
    return input.replaceAll("<", "").replaceAll(">", "") as T;
  }

  if (typeof input === "number" || typeof input === "boolean") return input;

  if (input instanceof Date) return input;

  if (Array.isArray(input)) {
    return input.map((x) => sanitizeForDatabase(x)) as T;
  }

  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      // Firestore rejeita `undefined`. Omitimos o campo em vez de gravá-lo.
      if (v === undefined) continue;
      out[k] = sanitizeForDatabase(v);
    }
    return out as T;
  }

  return input;
}

export function validateRequiredText(
  value: unknown,
  label: string,
  opts?: { minLen?: number; maxLen?: number }
): ValidationResult<string> {
  const str = typeof value === "string" ? value.trim() : "";
  const errors: string[] = [];
  if (!str) errors.push(`${label} é obrigatório.`);
  if (opts?.minLen !== undefined && str.length < opts.minLen) {
    errors.push(`${label} deve ter pelo menos ${opts.minLen} caracteres.`);
  }
  if (opts?.maxLen !== undefined && str.length > opts.maxLen) {
    errors.push(`${label} deve ter no máximo ${opts.maxLen} caracteres.`);
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: str };
}

export function validateOptionalText(
  value: unknown,
  label: string,
  opts?: { maxLen?: number }
): ValidationResult<string> {
  const str = typeof value === "string" ? value.trim() : "";
  const errors: string[] = [];
  if (opts?.maxLen !== undefined && str.length > opts.maxLen) {
    errors.push(`${label} deve ter no máximo ${opts.maxLen} caracteres.`);
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: str };
}

export function validateNonNegativeNumber(
  value: unknown,
  label: string
): ValidationResult<number> {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return { ok: false, errors: [`${label} é inválido.`] };
  if (n < 0) return { ok: false, errors: [`${label} não pode ser negativo.`] };
  return { ok: true, value: n };
}

export function validateDateISO(
  value: unknown,
  label: string,
  opts?: { minYear?: number; maxYear?: number }
): ValidationResult<string> {
  const str = typeof value === "string" ? value.trim() : "";
  if (!str) return { ok: false, errors: [`${label} é obrigatório.`] };
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return { ok: false, errors: [`${label} é inválida.`] };
  const year = d.getFullYear();
  const minYear = opts?.minYear ?? 1900;
  const maxYear = opts?.maxYear ?? 2100;
  if (year < minYear || year > maxYear) {
    return {
      ok: false,
      errors: [`${label} deve estar entre ${minYear} e ${maxYear}.`],
    };
  }
  // keep as string (input is already yyyy-mm-dd)
  return { ok: true, value: str };
}

export function validateEmail(value: unknown, label: string): ValidationResult<string> {
  const str = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!str) return { ok: false, errors: [`${label} é obrigatório.`] };
  if (str.length > 100) {
    return { ok: false, errors: [`${label} deve ter no máximo 100 caracteres.`] };
  }
  // robust-enough for UX: no spaces, one @, domain with at least one dot, TLD >= 2
  const ok = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(
    str
  );
  return ok ? { ok: true, value: str } : { ok: false, errors: [`${label} é inválido.`] };
}

export function validatePhoneBR(value: unknown, label: string): ValidationResult<string> {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return { ok: false, errors: [`${label} é obrigatório.`] };
  const digits = raw.replace(/\D/g, "");
  // Accept 10 or 11 digits (with DDD)
  if (!(digits.length === 10 || digits.length === 11)) {
    return { ok: false, errors: [`${label} deve ter DDD e 10-11 dígitos.`] };
  }
  return { ok: true, value: digits };
}

export function validateMoney(
  value: unknown,
  label: string,
  opts?: { decimals?: number; min?: number; max?: number }
): ValidationResult<number> {
  const decimals = opts?.decimals ?? 2;
  const n =
    typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(n)) return { ok: false, errors: [`${label} é inválido.`] };
  if (n < 0) return { ok: false, errors: [`${label} não pode ser negativo.`] };
  const factor = Math.pow(10, decimals);
  // auto-limit decimals by rounding (requested behavior)
  const rounded = Math.round(n * factor) / factor;
  if (opts?.min !== undefined && rounded < opts.min) {
    return { ok: false, errors: [`${label} deve ser no mínimo ${opts.min}.`] };
  }
  if (opts?.max !== undefined && rounded > opts.max) {
    return { ok: false, errors: [`${label} deve ser no máximo ${opts.max}.`] };
  }
  return { ok: true, value: rounded };
}

export function validateCPF(value: unknown, label: string): ValidationResult<string> {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return { ok: false, errors: [`${label} é obrigatório.`] };
  const cpf = raw.replace(/\D/g, "");
  if (cpf.length !== 11) return { ok: false, errors: [`${label} deve ter 11 dígitos.`] };
  if (/^(\d)\1{10}$/.test(cpf)) return { ok: false, errors: [`${label} é inválido.`] };

  const calc = (base: string, factorStart: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * (factorStart - i);
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d1 = calc(cpf.slice(0, 9), 10);
  const d2 = calc(cpf.slice(0, 9) + String(d1), 11);
  if (Number(cpf[9]) !== d1 || Number(cpf[10]) !== d2) {
    return { ok: false, errors: [`${label} é inválido.`] };
  }
  return { ok: true, value: cpf };
}

export function validateCNPJ(value: unknown, label: string): ValidationResult<string> {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return { ok: false, errors: [`${label} é obrigatório.`] };
  const cnpj = raw.replace(/\D/g, "");
  if (cnpj.length !== 14) return { ok: false, errors: [`${label} deve ter 14 dígitos.`] };
  if (/^(\d)\1{13}$/.test(cnpj)) return { ok: false, errors: [`${label} é inválido.`] };

  const calc = (base: string, factors: number[]) => {
    let sum = 0;
    for (let i = 0; i < factors.length; i++) sum += Number(base[i]) * factors[i];
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d1 = calc(cnpj, [5,4,3,2,9,8,7,6,5,4,3,2]);
  const d2 = calc(cnpj.slice(0, 12) + String(d1) + cnpj.slice(13, 14), [6,5,4,3,2,9,8,7,6,5,4,3,2]);
  if (Number(cnpj[12]) !== d1 || Number(cnpj[13]) !== d2) {
    return { ok: false, errors: [`${label} é inválido.`] };
  }
  return { ok: true, value: cnpj };
}

export function toNumberStrict(
  value: unknown,
  label: string,
  opts?: { min?: number; max?: number; allowNull?: boolean }
): ValidationResult<number | null> {
  if (value === null || value === undefined) {
    return opts?.allowNull ? { ok: true, value: null } : { ok: false, errors: [`${label} é obrigatório.`] };
  }
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(n)) return { ok: false, errors: [`${label} é inválido.`] };
  if (opts?.min !== undefined && n < opts.min) return { ok: false, errors: [`${label} deve ser no mínimo ${opts.min}.`] };
  if (opts?.max !== undefined && n > opts.max) return { ok: false, errors: [`${label} deve ser no máximo ${opts.max}.`] };
  return { ok: true, value: n };
}

export function validateIntPositive(
  value: unknown,
  label: string,
  opts?: { min?: number; max?: number }
): ValidationResult<number> {
  const n = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(n)) return { ok: false, errors: [`${label} é inválido.`] };
  if (!Number.isInteger(n)) return { ok: false, errors: [`${label} deve ser um número inteiro.`] };
  if (n <= 0) return { ok: false, errors: [`${label} deve ser maior que 0.`] };
  if (opts?.min !== undefined && n < opts.min) return { ok: false, errors: [`${label} deve ser no mínimo ${opts.min}.`] };
  if (opts?.max !== undefined && n > opts.max) return { ok: false, errors: [`${label} deve ser no máximo ${opts.max}.`] };
  return { ok: true, value: n };
}

export function validatePercentage(value: unknown, label: string): ValidationResult<number> {
  const n = typeof value === "number" ? value : Number(String(value).replace("%", "").trim());
  if (!Number.isFinite(n)) return { ok: false, errors: [`${label} é inválido.`] };
  if (n < 0 || n > 100) return { ok: false, errors: [`${label} deve estar entre 0 e 100.`] };
  return { ok: true, value: n };
}

export function validateNumberRange(
  value: unknown,
  label: string,
  opts: { min: number; max: number }
): ValidationResult<number> {
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(n)) return { ok: false, errors: [`${label} é inválido.`] };
  if (n < opts.min || n > opts.max) {
    return { ok: false, errors: [`${label} deve estar entre ${opts.min} e ${opts.max}.`] };
  }
  return { ok: true, value: n };
}

export function validateDateInterval(
  start: unknown,
  end: unknown,
  labels?: { start?: string; end?: string }
): ValidationResult<{ start: string; end: string }> {
  const startV = validateDateISO(start, labels?.start ?? "Data inicial");
  const endV = validateDateISO(end, labels?.end ?? "Data final");
  const base = collect([startV, endV]);
  if (!base.ok) return { ok: false, errors: base.errors };
  if (!isOk(startV) || !isOk(endV)) return { ok: false, errors: ["Erro inesperado de validação."] };
  if (new Date(startV.value).getTime() > new Date(endV.value).getTime()) {
    return { ok: false, errors: ["Data inicial não pode ser maior que a data final."] };
  }
  return { ok: true, value: { start: startV.value, end: endV.value } };
}

export function validateStringArray(
  value: unknown,
  label: string,
  opts?: { minItems?: number; maxItems?: number; maxItemLen?: number }
): ValidationResult<string[]> {
  const arr = Array.isArray(value) ? value : typeof value === "string" && value.trim() ? [value] : [];
  const clean = arr
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => (opts?.maxItemLen ? x.slice(0, opts.maxItemLen) : x));

  const errors: string[] = [];
  if (opts?.minItems !== undefined && clean.length < opts.minItems) {
    errors.push(`${label} deve ter pelo menos ${opts.minItems} item(ns).`);
  }
  if (opts?.maxItems !== undefined && clean.length > opts.maxItems) {
    errors.push(`${label} deve ter no máximo ${opts.maxItems} item(ns).`);
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: clean };
}

function collect(
  results: Array<ValidationResult<unknown>>
): { ok: true } | { ok: false; errors: string[] } {
  const errors = results.flatMap((r) => (r.ok ? [] : r.errors));
  return errors.length ? { ok: false, errors } : { ok: true };
}

// ===== Domain validations (Gerenciamento de Obras) =====

export function validateProjectInput(input: {
  name: unknown;
  client: unknown;
  description: unknown;
  startDate: unknown;
  endDate: unknown;
  budget: unknown;
  labor: unknown;
  team: unknown;
}): ValidationResult<{
  name: string;
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  labor: string;
  team: string[];
}> {
  const name = validateRequiredText(input.name, "Nome da obra", { minLen: 2, maxLen: 120 });
  const client = validateRequiredText(input.client, "Cliente", { minLen: 2, maxLen: 120 });
  const description = validateOptionalText(input.description, "Descrição", { maxLen: 2000 });
  const startDate = validateDateISO(input.startDate, "Data de início", { minYear: 1900, maxYear: 2100 });
  const endDate = validateDateISO(input.endDate, "Data de término", { minYear: 1900, maxYear: 2100 });
  const budget = validateMoney(input.budget, "Orçamento (R$)", { decimals: 2, min: 0 });
  const labor = validateOptionalText(input.labor, "Mão de obra", { maxLen: 200 });

  const team = Array.isArray(input.team) ? input.team : [];
  const cleanTeam = team
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean);

  const base = collect([name, client, description, startDate, endDate, budget, labor]);
  if (!base.ok) return { ok: false, errors: base.errors };
  if (
    !isOk(name) ||
    !isOk(client) ||
    !isOk(description) ||
    !isOk(startDate) ||
    !isOk(endDate) ||
    !isOk(budget) ||
    !isOk(labor)
  ) {
    return { ok: false, errors: ["Erro inesperado de validação."] };
  }

  // Date interval
  if (new Date(startDate.value).getTime() > new Date(endDate.value).getTime()) {
    return { ok: false, errors: ["Data de início não pode ser depois da data de término."] };
  }

  const value = sanitizeForDatabase({
    name: name.value,
    client: client.value,
    description: description.value,
    startDate: startDate.value,
    endDate: endDate.value,
    budget: budget.value,
    labor: labor.value,
    team: cleanTeam,
  });

  return { ok: true, value };
}

export function validateInventoryItemInput(input: {
  projectId: unknown;
  name: unknown;
  category: unknown;
  unit: unknown;
  quantity: unknown;
  minStock: unknown;
  maxStock: unknown;
  price: unknown;
  supplier: unknown;
  location: unknown;
}): ValidationResult<{
  projectId: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string;
  location: string;
}> {
  const projectId = validateRequiredText(input.projectId, "Obra relacionada");
  const name = validateRequiredText(input.name, "Nome do item", { minLen: 2, maxLen: 120 });
  const category = validateRequiredText(input.category, "Categoria", { minLen: 2, maxLen: 80 });
  const unit = validateRequiredText(input.unit, "Unidade", { minLen: 1, maxLen: 10 });
  const quantity = validateNonNegativeNumber(input.quantity, "Quantidade");
  const minStock = validateNonNegativeNumber(input.minStock, "Estoque mínimo");
  const maxStock = validateNonNegativeNumber(input.maxStock, "Estoque máximo");
  const price = validateMoney(input.price, "Preço unitário (R$)", { decimals: 2 });
  const supplier = validateOptionalText(input.supplier, "Fornecedor", { maxLen: 120 });
  const location = validateOptionalText(input.location, "Localização", { maxLen: 120 });

  const base = collect([projectId, name, category, unit, quantity, minStock, maxStock, price, supplier, location]);
  if (!base.ok) return { ok: false, errors: base.errors };
  if (
    !isOk(projectId) ||
    !isOk(name) ||
    !isOk(category) ||
    !isOk(unit) ||
    !isOk(quantity) ||
    !isOk(minStock) ||
    !isOk(maxStock) ||
    !isOk(price) ||
    !isOk(supplier) ||
    !isOk(location)
  ) {
    return { ok: false, errors: ["Erro inesperado de validação."] };
  }
  if (maxStock.value > 0 && minStock.value > maxStock.value) {
    return { ok: false, errors: ["Estoque mínimo não pode ser maior que o estoque máximo."] };
  }

  return {
    ok: true,
    value: sanitizeForDatabase({
      projectId: projectId.value,
      name: name.value,
      category: category.value,
      unit: unit.value,
      quantity: quantity.value,
      minStock: minStock.value,
      maxStock: maxStock.value,
      price: price.value,
      supplier: supplier.value,
      location: location.value,
    }),
  };
}

export function validateDiaryEntryInput(
  input: { projectId: unknown; obraName: unknown; date: unknown; activities: unknown },
  opts?: { allowDraft?: boolean }
): ValidationResult<{ projectId: string; obraName: string; date: string; activities: string }> {
  const allowDraft = opts?.allowDraft ?? false;
  const warnings: string[] = [];

  const projectId = validateRequiredText(input.projectId, "Obra");
  const obraName = validateRequiredText(input.obraName, "Nome da obra", { minLen: 2, maxLen: 120 });
  const date = validateDateISO(input.date, "Data", { minYear: 1900, maxYear: 2100 });

  const activities = allowDraft
    ? validateOptionalText(input.activities, "Atividades", { maxLen: 10000 })
    : validateRequiredText(input.activities, "Atividades", { minLen: 3, maxLen: 10000 });

  const base = collect([projectId, obraName, date, activities]);
  if (!base.ok) {
    if (allowDraft) {
      warnings.push(...base.errors);
      return {
        ok: true,
        value: sanitizeForDatabase({
          projectId: typeof input.projectId === "string" ? input.projectId : "",
          obraName: typeof input.obraName === "string" ? input.obraName.trim() : "",
          date: typeof input.date === "string" ? input.date.trim() : "",
          activities: typeof input.activities === "string" ? input.activities.trim() : "",
        }),
        warnings,
      };
    }
    return { ok: false, errors: base.errors };
  }
  if (!isOk(projectId) || !isOk(obraName) || !isOk(date) || !isOk(activities)) {
    return { ok: false, errors: ["Erro inesperado de validação."] };
  }

  return {
    ok: true,
    value: sanitizeForDatabase({
      projectId: projectId.value,
      obraName: obraName.value,
      date: date.value,
      activities: activities.value,
    }),
    warnings: warnings.length ? warnings : undefined,
  };
}

// ===== Reports (RDO/Expense/Hydrostatic/Completion) =====

export function validateObraReportInput<T extends { type: string; projectId: unknown; date: unknown }>(
  input: T
): ValidationResult<T> {
  const projectId = validateRequiredText(input.projectId, "Obra");
  const date = validateDateISO(input.date, "Data", { minYear: 1900, maxYear: 2100 });
  const base = collect([projectId, date]);
  if (!base.ok) return { ok: false, errors: base.errors };
  return { ok: true, value: sanitizeForDatabase(input) };
}

// ===== Service request / visits / equalizador (formData) =====

export function validateServiceRequestFormData(formData: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const category = validateRequiredText(formData.q1, "Categoria");
  const requestDate = validateDateISO(formData.q2, "Data da solicitação", { minYear: 1900, maxYear: 2100 });
  const requesterName = validateRequiredText(formData.q3, "Nome do solicitante");
  const requesterEmail = validateEmail(formData.q4, "E-mail do solicitante");
  const requesterPhone = validatePhoneBR(formData.q5, "Celular do solicitante");
  const company = validateRequiredText(formData.q16, "Empresa");
  const cnpj = validateCNPJ(formData.q18, "CNPJ");

  const extraErrors: string[] = [];
  const regional = typeof formData.q11 === "string" ? formData.q11 : "";
  const q12 = typeof formData.q12 === "string" ? formData.q12 : "";
  const q13 = typeof formData.q13 === "string" ? formData.q13 : "";
  const q14 = typeof formData.q14 === "string" ? formData.q14 : "";
  const q15 = typeof formData.q15 === "string" ? formData.q15 : "";
  const isPlaceholder = (v: string) =>
    !v.trim() || v.toLowerCase().includes("selecionar sua resposta");

  if (regional.includes("Carlos Moraes")) {
    if (isPlaceholder(q12)) extraErrors.push("Selecione uma opção em '12 - VEND I & II'.");
  } else if (regional.includes("Rogério Foltran")) {
    if (isPlaceholder(q13)) extraErrors.push("Selecione uma opção em '13 - HUNTERS'.");
  } else if (regional.includes("Davi Salgado")) {
    if (isPlaceholder(q14)) extraErrors.push("Selecione uma opção em '14 - HVAC'.");
  } else if (regional.includes("Nic Romano")) {
    if (isPlaceholder(q15)) extraErrors.push("Selecione uma opção em '15 - Expansão & Novos Negócios'.");
  }

  const base = collect([category, requestDate, requesterName, requesterEmail, requesterPhone, company, cnpj]);
  if (!base.ok) return { ok: false, errors: base.errors };
  if (extraErrors.length) return { ok: false, errors: extraErrors };

  return { ok: true, value: sanitizeForDatabase(formData) };
}

export function validateVisitFormData(formData: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const action = validateRequiredText(formData.q6, "Ação");
  const client = validateRequiredText(formData.q7, "Nome do cliente");
  const maybeCnpjRaw = typeof formData.q8 === "string" ? formData.q8.trim() : "";
  const cnpj = maybeCnpjRaw ? validateCNPJ(maybeCnpjRaw, "CNPJ do cliente") : ({ ok: true, value: "" } as const);

  const base = collect([action, client, cnpj]);
  if (!base.ok) return { ok: false, errors: base.errors };
  return { ok: true, value: sanitizeForDatabase(formData) };
}

export function validateEqualizadorFormData(formData: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
  const client = validateRequiredText(formData.q1, "Cliente");
  const location = validateRequiredText(formData.q2, "Local da obra");
  const visitDate = validateDateISO(formData.q3, "Data de emissão", { minYear: 1900, maxYear: 2100 });
  const base = collect([client, location, visitDate]);
  if (!base.ok) return { ok: false, errors: base.errors };
  return { ok: true, value: sanitizeForDatabase(formData) };
}

