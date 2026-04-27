"use client";

import type React from "react";

import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "icon";
  size?: "sm" | "md" | "lg";
  title?: string;
  "aria-label"?: string;
}

export default function Button({
  children,
  type = "button",
  onClick,
  disabled,
  className,
  variant = "primary",
  size = "md",
  title,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const buttonClasses = ["button", `button--${variant}`, `button--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      title={title}
      aria-label={ariaLabel}
    >
      <span className="button-text">{children}</span>
    </button>
  );
}
