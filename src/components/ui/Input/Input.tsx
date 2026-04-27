"use client";

import { useId, useState } from "react";
import "./Input.css";

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  variant?: "default" | "modal";
}

export default function Input({
  type,
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

  return (
    <div
      className={`input-container input--${variant} ${error ? "has-error" : ""} ${
        isFocused ? "focused" : ""
      } ${
        value ? "has-value" : ""
      }`}
    >
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className="input-field"
        aria-invalid={error ? "true" : "false"}
      />
      <label className="input-label" htmlFor={id}>
        {placeholder}
      </label>
      {helperText ? (
        <div className={`input-helper ${error ? "input-helper--error" : ""}`}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
}
