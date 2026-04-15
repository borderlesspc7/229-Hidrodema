import type { Project } from "../../../../types/obrasGerenciamentoModule";

type Props = {
  projectId?: string;
  projects: Project[];
  fallbackLabel?: string;
};

function hashToHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

export default function ProjectBadge({
  projectId,
  projects,
  fallbackLabel = "Sem obra",
}: Props) {
  if (!projectId) {
    return <span className="obras-project-badge obras-project-badge--none">{fallbackLabel}</span>;
  }
  const project = projects.find((p) => p.id === projectId);
  const label = project?.name ?? fallbackLabel;
  const hue = hashToHue(projectId);
  const style: React.CSSProperties = {
    background: `hsla(${hue}, 85%, 55%, 0.14)`,
    borderColor: `hsla(${hue}, 85%, 45%, 0.35)`,
    color: `hsl(${hue}, 75%, 28%)`,
  };
  return (
    <span className="obras-project-badge" style={style} title={label}>
      {label}
    </span>
  );
}

