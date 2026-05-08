import type {
  DynamicFormCondition,
  DynamicFormField,
  DynamicFormTemplate,
  DynamicFormValue,
} from "../types/dynamicForms";

export type DynamicFormState = Record<string, DynamicFormValue>;

function asArray(v: DynamicFormValue): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function condOk(cond: DynamicFormCondition, values: DynamicFormState): boolean {
  const v = values[cond.fieldId];
  if (cond.op === "notEmpty") {
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return Boolean(v.trim());
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }
  if (cond.op === "equals") {
    return v === cond.value;
  }
  if (cond.op === "includes") {
    return asArray(v).includes(cond.value);
  }
  return true;
}

export function shouldShowDynamicField(
  field: DynamicFormField,
  values: DynamicFormState
): boolean {
  if (!field.when || field.when.length === 0) return true;
  return field.when.every((c) => condOk(c, values));
}

export function validateDynamicForm(
  template: Pick<DynamicFormTemplate, "fields">,
  values: DynamicFormState
): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  for (const f of template.fields) {
    if (!shouldShowDynamicField(f, values)) continue;
    const v = values[f.id];
    const validators = f.validators ?? [];
    for (const rule of validators) {
      if (rule.type === "required") {
        const empty =
          v === null ||
          v === undefined ||
          (typeof v === "string" && !v.trim()) ||
          (Array.isArray(v) && v.length === 0);
        if (empty) errors.push(`${f.label} é obrigatório.`);
      } else if (rule.type === "minLen") {
        const s = typeof v === "string" ? v : "";
        if (s.trim().length < rule.value) {
          errors.push(`${f.label} deve ter pelo menos ${rule.value} caracteres.`);
        }
      } else if (rule.type === "maxLen") {
        const s = typeof v === "string" ? v : "";
        if (s.trim().length > rule.value) {
          errors.push(`${f.label} deve ter no máximo ${rule.value} caracteres.`);
        }
      } else if (rule.type === "min" || rule.type === "max") {
        const n = typeof v === "number" ? v : Number(v);
        if (!Number.isFinite(n)) continue;
        if (rule.type === "min" && n < rule.value) {
          errors.push(`${f.label} deve ser no mínimo ${rule.value}.`);
        }
        if (rule.type === "max" && n > rule.value) {
          errors.push(`${f.label} deve ser no máximo ${rule.value}.`);
        }
      }
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}

