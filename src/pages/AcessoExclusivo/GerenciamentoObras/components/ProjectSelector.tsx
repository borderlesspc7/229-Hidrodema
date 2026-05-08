import type { Project } from "../../../../types/obrasGerenciamentoModule";

type Props = {
  projects: Project[];
  value: string;
  onChange: (projectId: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  allowEmpty?: boolean;
};

export default function ProjectSelector({
  projects,
  value,
  onChange,
  label = "Obra",
  placeholder = "Selecione uma obra",
  helperText,
  required,
  allowEmpty,
}: Props) {
  if (projects.length === 0) return null;

  return (
    <div className="obras-form-field obras-field-full">
      <label>
        {label}
        {required ? " *" : ""}
      </label>
      <select
        className="obras-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {allowEmpty ? <option value="">{placeholder}</option> : null}
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      {helperText ? <span className="obras-helper-text">{helperText}</span> : null}
    </div>
  );
}

