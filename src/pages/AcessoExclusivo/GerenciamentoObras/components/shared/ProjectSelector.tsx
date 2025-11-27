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
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: "14px",
          border: "2px solid #e2e8f0",
          borderRadius: "8px",
          outline: "none",
          transition: "all 0.2s",
          backgroundColor: "#ffffff",
          cursor: "pointer",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#3b82f6";
          e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e2e8f0";
          e.target.style.boxShadow = "none";
        }}
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

