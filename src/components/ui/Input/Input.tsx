"use client";

import { useId, useState } from "react";
import "./Input.css";

interface InputProps {
  type: string;
  /** Texto do label (ou label flutuante no modo default) */
  label?: string;
  /** Placeholder do input (principalmente no modo auth) */
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  variant?: "default" | "modal" | "auth";
}

export default function Input({
  type,
  label,
  placeholder,
  value,
  onChange,
  required,
  error,
  helperText,
  variant = "default",
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const id = useId();

  const floatingLabelText = label ?? placeholder ?? "";
  const showTopLabel = variant === "auth" && Boolean(label);

  return (
    <div
      className={`input-container input--${variant} ${error ? "has-error" : ""} ${
        isFocused ? "focused" : ""
      } ${
        value ? "has-value" : ""
      }`}
    >
      {showTopLabel ? (
        <div className="input-top-label">
          <label className="input-top-label__text" htmlFor={id}>
            {label}
          </label>
          {required ? <span className="input-top-label__req">*</span> : null}
        </div>
      ) : null}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className="input-field"
        placeholder={showTopLabel ? placeholder : undefined}
        aria-invalid={error ? "true" : "false"}
      />
      {!showTopLabel ? (
        <label className="input-label" htmlFor={id}>
          {floatingLabelText}
        </label>
      ) : null}
      {helperText ? (
        <div className={`input-helper ${error ? "input-helper--error" : ""}`}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
}
