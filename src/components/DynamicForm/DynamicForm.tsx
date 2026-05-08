import { useMemo } from "react";
import Input from "../ui/Input/Input";
import type { DynamicFormField, DynamicFormTemplate, DynamicFormValue } from "../../types/dynamicForms";
import { shouldShowDynamicField } from "../../lib/dynamicFormRuntime";

type Props = {
  template: Pick<DynamicFormTemplate, "fields">;
  value: Record<string, DynamicFormValue>;
  onChange: (next: Record<string, DynamicFormValue>) => void;
};

function Field({
  field,
  value,
  onChange,
}: {
  field: DynamicFormField;
  value: DynamicFormValue;
  onChange: (v: DynamicFormValue) => void;
}) {
  const label = (
    <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>
      {field.label}
      {field.validators?.some((v) => v.type === "required") ? (
        <span style={{ color: "#ef4444" }}> *</span>
      ) : null}
    </label>
  );

  if (field.type === "text" || field.type === "date" || field.type === "time") {
    return (
      <div style={{ marginBottom: 14 }}>
        {label}
        {field.helpText ? (
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>{field.helpText}</div>
        ) : null}
        <Input
          type={field.type === "text" ? "text" : field.type}
          placeholder={field.placeholder ?? ""}
          value={typeof value === "string" ? value : String(value ?? "")}
          onChange={(v) => onChange(v)}
        />
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div style={{ marginBottom: 14 }}>
        {label}
        <Input
          type="number"
          placeholder={field.placeholder ?? ""}
          value={typeof value === "number" ? String(value) : String(value ?? "")}
          onChange={(v) => onChange(v === "" ? null : Number(v))}
        />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div style={{ marginBottom: 14 }}>
        {label}
        <textarea
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "2px solid #e2e8f0",
            fontFamily: "inherit",
          }}
          rows={4}
          placeholder={field.placeholder ?? ""}
          value={typeof value === "string" ? value : String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div style={{ marginBottom: 14 }}>
        {label}
        <select
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "2px solid #e2e8f0",
          }}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Selecione…</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "radio") {
    const v = typeof value === "string" ? value : "";
    return (
      <div style={{ marginBottom: 14 }}>
        {label}
        <div style={{ display: "grid", gap: 8 }}>
          {(field.options ?? []).map((o) => (
            <label key={o} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="radio" checked={v === o} onChange={() => onChange(o)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    const arr = Array.isArray(value) ? value : typeof value === "string" && value ? [value] : [];
    return (
      <div style={{ marginBottom: 14 }}>
        {label}
        <div style={{ display: "grid", gap: 8 }}>
          {(field.options ?? []).map((o) => {
            const checked = arr.includes(o);
            return (
              <label key={o} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) onChange([...arr, o]);
                    else onChange(arr.filter((x) => x !== o));
                  }}
                />
                <span>{o}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

export default function DynamicForm({ template, value, onChange }: Props) {
  const visible = useMemo(
    () => template.fields.filter((f) => shouldShowDynamicField(f, value)),
    [template.fields, value]
  );

  return (
    <div>
      {visible.map((f) => (
        <Field
          key={f.id}
          field={f}
          value={value[f.id] ?? null}
          onChange={(v) => onChange({ ...value, [f.id]: v })}
        />
      ))}
    </div>
  );
}

