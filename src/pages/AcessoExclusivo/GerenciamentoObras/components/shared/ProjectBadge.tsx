import { FiMapPin } from "react-icons/fi";
import type { Project } from "../../../../../services/obrasService";

interface ProjectBadgeProps {
  projectId?: string;
  projects: Project[];
  size?: "small" | "medium" | "large";
}

export default function ProjectBadge({
  projectId,
  projects,
  size = "medium",
}: ProjectBadgeProps) {
  if (!projectId) {
    return (
      <span
        className={`obras-project-badge obras-project-badge-${size} obras-project-badge-none`}
      >
        <FiMapPin size={size === "small" ? 12 : size === "medium" ? 14 : 16} />
        Sem obra vinculada
      </span>
    );
  }

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <span
        className={`obras-project-badge obras-project-badge-${size} obras-project-badge-none`}
      >
        <FiMapPin size={size === "small" ? 12 : size === "medium" ? 14 : 16} />
        Obra não encontrada
      </span>
    );
  }

  return (
    <span
      className={`obras-project-badge obras-project-badge-${size}`}
      title={`Obra: ${project.name} - Cliente: ${project.client}`}
    >
      <FiMapPin size={size === "small" ? 12 : size === "medium" ? 14 : 16} />
      {project.name}
    </span>
  );
}

