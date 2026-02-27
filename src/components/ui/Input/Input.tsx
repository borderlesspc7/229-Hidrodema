"use client";

import { useState, useEffect } from "react";
import "./Input.css";
import { applyMask, type MaskType } from "../../../utils/masks";

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  mask?: MaskType;
  min?: number;
  max?: number;
  readOnly?: boolean;
}

export default function Input({
  type,
  placeholder,
  value,
  onChange,
  required,
  mask,
  min,
  max,
  readOnly = false,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (mask && mask !== "none") {
      // Para currency: value já vem em centavos (dígitos) dos formulários
      if (mask === "currency") {
        const centavos = (value || "0").toString().replace(/\D/g, "") || "0";
        setDisplayValue(applyMask(centavos, mask));
      } else {
        setDisplayValue(applyMask(value, mask));
      }
    } else {
      setDisplayValue(value);
    }
  }, [value, mask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Aplica máscara se especificada
    if (mask && mask !== "none") {
      newValue = applyMask(newValue, mask);
    }

    // Para campos numéricos, valida min/max e remove negativos
    if (
      type === "number" ||
      mask === "number" ||
      mask === "numberDecimal" ||
      mask === "currency"
    ) {
      // Remove caracteres não numéricos (exceto ponto para decimais)
      if (mask === "numberDecimal") {
        newValue = newValue.replace(/[^\d.]/g, "");
        // Remove múltiplos pontos
        const parts = newValue.split(".");
        if (parts.length > 2) {
          newValue = parts[0] + "." + parts.slice(1).join("");
        }
      } else {
        newValue = newValue.replace(/\D/g, "");
      }

      // Converte para número para validação (currency: centavos → reais)
      const rawNum = parseFloat(newValue.replace(/\D/g, "")) || 0;
      const numValue =
        mask === "currency" ? rawNum / 100 : rawNum;

      // Valida mínimo (não permite negativos por padrão)
      if (min !== undefined && numValue < min) {
        newValue =
          mask === "currency"
            ? String(Math.max(0, Math.round(min * 100)))
            : min.toString();
      } else if (min === undefined && numValue < 0) {
        newValue = "0";
      }

      // Valida máximo
      if (max !== undefined && numValue > max) {
        newValue =
          mask === "currency"
            ? String(Math.round(max * 100))
            : max.toString();
      }
    }

    // Atualiza display
    if (mask && mask !== "none") {
      setDisplayValue(applyMask(newValue, mask));
    } else {
      setDisplayValue(newValue);
    }

    // Para máscaras, retorna o valor limpo (sem formatação)
    if (mask === "currency") {
      // Para currency, o valor já está em centavos, então retorna direto
      const numericValue = newValue.replace(/\D/g, "");
      onChange(numericValue);
    } else if (
      mask &&
      mask !== "none" &&
      mask !== "number" &&
      mask !== "numberDecimal"
    ) {
      // Para outras máscaras, retorna apenas números
      onChange(newValue.replace(/\D/g, ""));
    } else {
      // Para campos normais ou números, retorna o valor direto
      onChange(newValue);
    }
  };

  // Determina o tipo de input baseado na máscara
  const inputType =
    mask === "currency" || mask === "number" || mask === "numberDecimal"
      ? "text"
      : type;

  return (
    <div
      className={`input-container ${isFocused ? "focused" : ""} ${
        displayValue ? "has-value" : ""
      }`}
    >
      <input
        type={inputType}
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className="input-field"
        min={min !== undefined && type === "number" ? min : undefined}
        max={max !== undefined && type === "number" ? max : undefined}
        readOnly={readOnly}
      />
      <label className="input-label">{placeholder}</label>
    </div>
  );
}
