import type { Project } from "../../../../../services/obrasService";

interface ProjectSelectorProps {
  projects: Project[];
  value: string;
  onChange: (projectId: string) => void;
  required?: boolean;
  label?: string;
  showAllOption?: boolean;
}

export default function ProjectSelector({
  projects,
  value,
  onChange,
  required = false,
  label = "Obra",
  showAllOption = false,
}: ProjectSelectorProps) {
  return (
    <div className="form-group">
      <label htmlFor="projectId">
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <select
        id="projectId"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="project-select"
      >
        <option value="">
          {required ? "Selecione uma obra" : "Nenhuma obra específica"}
        </option>
        {showAllOption && <option value="all">Todas as obras</option>}
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name} - {project.client}
          </option>
        ))}
      </select>
    </div>
  );
}

