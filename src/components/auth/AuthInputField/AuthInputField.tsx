import React from "react";
import "./AuthInputField.css";

export interface AuthInputFieldProps {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export default function AuthInputField({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder = "",
  error,
  required,
  disabled = false,
  autoComplete,
}: AuthInputFieldProps) {
  return (
    <div className={`auth-input ${error ? "auth-input--error" : ""}`}>
      <label htmlFor={id} className="auth-input__label">
        {label}
        {required && <span className="auth-input__required"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        required={required}
        className="auth-input__field"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="auth-input__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
