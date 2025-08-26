"use client";

import { useState } from "react";
import "./Input.css";

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function Input({
  type,
  placeholder,
  value,
  onChange,
  required,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`input-container ${isFocused ? "focused" : ""} ${
        value ? "has-value" : ""
      }`}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className="input-field"
      />
      <label className="input-label">{placeholder}</label>
    </div>
  );
}
