export type DynamicFormValue = string | number | boolean | string[] | null;

export type DynamicFormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "select"
  | "radio"
  | "checkbox";

export type DynamicFormCondition =
  | { fieldId: string; op: "equals"; value: string | number | boolean }
  | { fieldId: string; op: "includes"; value: string }
  | { fieldId: string; op: "notEmpty" };

export type DynamicFormValidator =
  | { type: "required" }
  | { type: "minLen"; value: number }
  | { type: "maxLen"; value: number }
  | { type: "min"; value: number }
  | { type: "max"; value: number };

export type DynamicFormField = {
  id: string;
  type: DynamicFormFieldType;
  label: string;
  section?: string;
  placeholder?: string;
  options?: string[];
  helpText?: string;
  when?: DynamicFormCondition[];
  validators?: DynamicFormValidator[];
};

export type DynamicFormTemplate = {
  id?: string;
  key: string; // ex: "visitas", "servicos", "obras-rdo"
  name: string;
  version: number;
  status: "active" | "archived";
  fields: DynamicFormField[];
  createdAt: string;
  updatedAt: string;
};

