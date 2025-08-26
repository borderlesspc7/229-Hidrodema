import "./Card.css";
import React from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  onClick?: () => void;
  image?: string;
  children?: React.ReactNode;
  variant?: "service" | "technology" | "marketing";
  size?: "small" | "medium" | "large";
  rounded?: boolean;
  shadow?: boolean;
  border?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  description,
  backgroundColor,
  textColor,
  onClick,
  image,
  children,
  variant = "service",
  size = "medium",
  rounded = true,
  shadow = true,
  border = false,
  className = "",
  icon,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const cardClasses = [
    "card",
    `card--${variant}`,
    `card--${size}`,
    rounded && "card--rounded",
    shadow && "card--shadow",
    border && "card--border",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClasses}
      style={{
        backgroundColor,
        color: textColor,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={handleClick}
    >
      {image && (
        <div className="card__image">
          <img src={image} alt={title} />
        </div>
      )}

      <div className="card__content">
        <div className="card__header">
          <h2 className="card__title">{title}</h2>
          <div className="card__subtitle-container">
            <span className="card__subtitle">{subtitle}</span>
            {variant === "service" && <span className="card__dots">•••</span>}
            {variant === "technology" && (
              <span className="card__dots">•••</span>
            )}
          </div>
        </div>

        <p className="card__description">{description}</p>

        {icon && <div className="card__icon">{icon}</div>}

        {children && <div className="card__children">{children}</div>}
      </div>
    </div>
  );
};

export default Card;
