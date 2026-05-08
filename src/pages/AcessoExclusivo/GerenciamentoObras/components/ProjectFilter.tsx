import type { Project } from "../../../../types/obrasGerenciamentoModule";

type Props = {
  projects: Project[];
  value: string;
  onChange: (projectId: string) => void;
  label?: string;
  allowAll?: boolean;
  helperText?: string;
};

export default function ProjectFilter({
  projects,
  value,
  onChange,
  label = "Filtrar por obra",
  allowAll = true,
  helperText,
}: Props) {
  if (projects.length === 0) return null;

  return (
    <div className="obras-project-filter">
      <div className="obras-form-field obras-field-full">
        <label>{label}</label>
        <select
          className="obras-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {allowAll ? <option value="">Todas as obras</option> : null}
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {helperText ? (
          <span className="obras-helper-text">{helperText}</span>
        ) : null}
      </div>
    </div>
  );
}

