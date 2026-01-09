import { FiFilter } from "react-icons/fi";
import type { Project } from "../../../../../services/obrasService";
import ProjectSelector from "./ProjectSelector";

interface ProjectFilterProps {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  showLabel?: boolean;
}

export default function ProjectFilter({
  projects,
  selectedProjectId,
  onProjectChange,
  showLabel = true,
}: ProjectFilterProps) {
  return (
    <div className="obras-project-filter">
      <div className="obras-filter-header">
        <FiFilter size={18} />
        {showLabel && <span className="obras-filter-label">Filtrar por Obra</span>}
      </div>
      <ProjectSelector
        projects={projects}
        value={selectedProjectId}
        onChange={onProjectChange}
        label=""
        showAllOption={true}
      />
    </div>
  );
}

