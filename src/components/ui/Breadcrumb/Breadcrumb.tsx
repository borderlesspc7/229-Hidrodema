import { Link } from "react-router-dom";
import "./Breadcrumb.css";

type Crumb = {
  label: string;
  to?: string;
};

type Props = {
  items: Crumb[];
  compact?: boolean;
  className?: string;
};

export default function Breadcrumb({ items, compact, className }: Props) {
  if (!items?.length) return null;
  const classes = ["breadcrumb", compact ? "breadcrumb--compact" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={classes} aria-label="Breadcrumb">
      <ol className="breadcrumb__list">
        {items.map((c, idx) => {
          const isLast = idx === items.length - 1;
          const content = c.to && !isLast ? (
            <Link className="breadcrumb__link" to={c.to}>
              {c.label}
            </Link>
          ) : (
            <span className="breadcrumb__current" aria-current={isLast ? "page" : undefined}>
              {c.label}
            </span>
          );

          return (
            <li key={`${c.label}-${idx}`} className="breadcrumb__item">
              {content}
              {!isLast && <span className="breadcrumb__sep">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

