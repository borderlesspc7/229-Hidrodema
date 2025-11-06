export const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, "");
};

export const formatCurrency = (value: string | number): string => {
  const numericValue =
    typeof value === "string" ? removeNonNumeric(value) : value.toString();

  if (!numericValue || numericValue === "0") return "";

  const number = parseFloat(numericValue) / 100;

  if (isNaN(number)) return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

export const unformatCurrency = (value: string): number => {
  const numericValue = removeNonNumeric(value);
  if (!numericValue) return 0;
  return parseFloat(numericValue) / 100;
};

export const formatPhone = (value: string): string => {
  const numbers = removeNonNumeric(value);

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
      6
    )}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
    7,
    11
  )}`;
};

export const formatCPF = (value: string): string => {
  const numbers = removeNonNumeric(value);

  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
    6,
    9
  )}-${numbers.slice(9, 11)}`;
};

export const formatCNPJ = (value: string): string => {
  const numbers = removeNonNumeric(value);

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  }
  if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
      5,
      8
    )}/${numbers.slice(8)}`;
  }
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
    5,
    8
  )}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

export const formatCPFCNPJ = (value: string): string => {
  const numbers = removeNonNumeric(value);

  if (numbers.length <= 11) {
    return formatCPF(value);
  }
  return formatCNPJ(value);
};

export const formatCEP = (value: string): string => {
  const numbers = removeNonNumeric(value);

  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

export const formatNumber = (
  value: string,
  allowDecimals: boolean = false
): string => {
  if (allowDecimals) {
    const cleaned = value.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  }
  return removeNonNumeric(value);
};

export type MaskType =
  | "currency"
  | "phone"
  | "cpf"
  | "cnpj"
  | "cpfcnpj"
  | "cep"
  | "number"
  | "numberDecimal"
  | "none";

export const applyMask = (value: string, maskType: MaskType): string => {
  switch (maskType) {
    case "currency":
      return formatCurrency(value);
    case "phone":
      return formatPhone(value);
    case "cpf":
      return formatCPF(value);
    case "cnpj":
      return formatCNPJ(value);
    case "cpfcnpj":
      return formatCPFCNPJ(value);
    case "cep":
      return formatCEP(value);
    case "number":
      return formatNumber(value, false);
    case "numberDecimal":
      return formatNumber(value, true);
    case "none":
    default:
      return value;
  }
};

export const removeMask = (value: string, maskType: MaskType): string => {
  if (maskType === "currency") {
    return unformatCurrency(value).toString();
  }
  return removeNonNumeric(value);
};
