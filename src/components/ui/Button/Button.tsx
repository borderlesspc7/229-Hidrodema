"use client";

import type React from "react";

import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  type = "button",
  onClick,
  disabled,
  className,
  variant = "primary",
}: ButtonProps) {
  const buttonClasses = ["button", `button--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      <span className="button-text">{children}</span>
    </button>
  );
}
