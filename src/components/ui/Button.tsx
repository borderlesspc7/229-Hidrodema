"use client";

import type React from "react";

import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({
  children,
  type = "button",
  onClick,
  disabled,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="custom-button"
    >
      <span className="button-text">{children}</span>
    </button>
  );
}
