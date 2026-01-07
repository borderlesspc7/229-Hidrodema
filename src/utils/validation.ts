/**
 * Utilitários de validação para garantir integridade dos dados
 * antes de enviar ao banco de dados
 */

// ===== VALIDAÇÕES DE TEXTO =====

/**
 * Valida e sanitiza texto geral
 */
export const sanitizeText = (text: string, maxLength: number = 500): string => {
  if (typeof text !== "string") return "";

  return text.trim().slice(0, maxLength).replace(/[<>]/g, ""); // Remove caracteres potencialmente perigosos
};

/**
 * Valida nome (não permite números, min 3 caracteres)
 */
export const validateName = (
  name: string
): { valid: boolean; error?: string } => {
  const sanitized = sanitizeText(name, 100);

  if (!sanitized) {
    return { valid: false, error: "Nome é obrigatório" };
  }

  if (sanitized.length < 3) {
    return { valid: false, error: "Nome deve ter pelo menos 3 caracteres" };
  }

  if (sanitized.length > 100) {
    return { valid: false, error: "Nome deve ter no máximo 100 caracteres" };
  }

  return { valid: true };
};

/**
 * Valida descrição/observação
 */
export const validateDescription = (
  description: string,
  required: boolean = false,
  maxLength: number = 1000
): { valid: boolean; error?: string } => {
  const sanitized = sanitizeText(description, maxLength);

  if (required && !sanitized) {
    return { valid: false, error: "Descrição é obrigatória" };
  }

  if (sanitized.length > maxLength) {
    return {
      valid: false,
      error: `Descrição deve ter no máximo ${maxLength} caracteres`,
    };
  }

  return { valid: true };
};

// ===== VALIDAÇÕES NUMÉRICAS =====

/**
 * Valida e sanitiza número
 */
export const sanitizeNumber = (value: string | number): number => {
  const num = parseFloat(String(value));
  return isNaN(num) ? 0 : num;
};

/**
 * Valida número positivo
 */
export const validatePositiveNumber = (
  value: string | number,
  fieldName: string = "Valor",
  required: boolean = true
): { valid: boolean; error?: string; value: number } => {
  const num = sanitizeNumber(value);

  if (required && num <= 0) {
    return {
      valid: false,
      error: `${fieldName} deve ser maior que zero`,
      value: 0,
    };
  }

  if (num < 0) {
    return {
      valid: false,
      error: `${fieldName} não pode ser negativo`,
      value: 0,
    };
  }

  return { valid: true, value: num };
};

/**
 * Valida quantidade (inteiro positivo)
 */
export const validateQuantity = (
  value: string | number,
  fieldName: string = "Quantidade",
  min: number = 1,
  max: number = 999999
): { valid: boolean; error?: string; value: number } => {
  const num = Math.floor(sanitizeNumber(value));

  if (num < min) {
    return {
      valid: false,
      error: `${fieldName} deve ser no mínimo ${min}`,
      value: min,
    };
  }

  if (num > max) {
    return {
      valid: false,
      error: `${fieldName} deve ser no máximo ${max}`,
      value: max,
    };
  }

  return { valid: true, value: num };
};

/**
 * Valida valor monetário
 */
export const validateMoney = (
  value: string | number,
  fieldName: string = "Valor",
  required: boolean = true,
  min: number = 0,
  max: number = 999999999
): { valid: boolean; error?: string; value: number } => {
  const num = sanitizeNumber(value);

  if (required && num <= 0) {
    return {
      valid: false,
      error: `${fieldName} é obrigatório e deve ser maior que zero`,
      value: 0,
    };
  }

  if (num < min) {
    return {
      valid: false,
      error: `${fieldName} deve ser no mínimo R$ ${min.toFixed(2)}`,
      value: min,
    };
  }

  if (num > max) {
    return {
      valid: false,
      error: `${fieldName} deve ser no máximo R$ ${max.toFixed(2)}`,
      value: max,
    };
  }

  // Limita a 2 casas decimais
  const rounded = Math.round(num * 100) / 100;

  return { valid: true, value: rounded };
};

/**
 * Valida porcentagem (0-100)
 */
export const validatePercentage = (
  value: string | number,
  fieldName: string = "Porcentagem"
): { valid: boolean; error?: string; value: number } => {
  const num = sanitizeNumber(value);

  if (num < 0) {
    return {
      valid: false,
      error: `${fieldName} não pode ser negativa`,
      value: 0,
    };
  }

  if (num > 100) {
    return {
      valid: false,
      error: `${fieldName} não pode ser maior que 100`,
      value: 100,
    };
  }

  return { valid: true, value: num };
};

// ===== VALIDAÇÕES DE DATA =====

/**
 * Valida data
 */
export const validateDate = (
  date: string,
  fieldName: string = "Data",
  required: boolean = true
): { valid: boolean; error?: string } => {
  if (!date || date.trim() === "") {
    if (required) {
      return { valid: false, error: `${fieldName} é obrigatória` };
    }
    return { valid: true };
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: `${fieldName} inválida` };
  }

  // Valida se não é uma data muito antiga ou muito futura
  const minDate = new Date("1900-01-01");
  const maxDate = new Date("2100-12-31");

  if (dateObj < minDate || dateObj > maxDate) {
    return { valid: false, error: `${fieldName} deve estar entre 1900 e 2100` };
  }

  return { valid: true };
};

/**
 * Valida intervalo de datas (início antes do fim)
 */
export const validateDateRange = (
  startDate: string,
  endDate: string
): { valid: boolean; error?: string } => {
  const startValidation = validateDate(startDate, "Data de início");
  if (!startValidation.valid) return startValidation;

  const endValidation = validateDate(endDate, "Data de término");
  if (!endValidation.valid) return endValidation;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return {
      valid: false,
      error: "Data de início deve ser anterior à data de término",
    };
  }

  return { valid: true };
};

// ===== VALIDAÇÕES DE CONTATO =====

/**
 * Valida email
 */
export const validateEmail = (
  email: string,
  required: boolean = true
): { valid: boolean; error?: string } => {
  const sanitized = email.trim().toLowerCase();

  if (!sanitized) {
    if (required) {
      return { valid: false, error: "Email é obrigatório" };
    }
    return { valid: true };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: "Email inválido" };
  }

  if (sanitized.length > 100) {
    return { valid: false, error: "Email deve ter no máximo 100 caracteres" };
  }

  return { valid: true };
};

/**
 * Valida telefone brasileiro (apenas números)
 */
export const validatePhone = (
  phone: string,
  required: boolean = false
): { valid: boolean; error?: string } => {
  const cleaned = phone.replace(/\D/g, "");

  if (!cleaned) {
    if (required) {
      return { valid: false, error: "Telefone é obrigatório" };
    }
    return { valid: true };
  }

  // Aceita telefones com 10 ou 11 dígitos (com ou sem 9 na frente)
  if (cleaned.length < 10 || cleaned.length > 11) {
    return { valid: false, error: "Telefone deve ter 10 ou 11 dígitos" };
  }

  return { valid: true };
};

/**
 * Valida CPF
 */
export const validateCPF = (
  cpf: string,
  required: boolean = false
): { valid: boolean; error?: string } => {
  const cleaned = cpf.replace(/\D/g, "");

  if (!cleaned) {
    if (required) {
      return { valid: false, error: "CPF é obrigatório" };
    }
    return { valid: true };
  }

  if (cleaned.length !== 11) {
    return { valid: false, error: "CPF deve ter 11 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return { valid: false, error: "CPF inválido" };
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;

  if (checkDigit !== parseInt(cleaned.charAt(9))) {
    return { valid: false, error: "CPF inválido" };
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;

  if (checkDigit !== parseInt(cleaned.charAt(10))) {
    return { valid: false, error: "CPF inválido" };
  }

  return { valid: true };
};

/**
 * Valida CNPJ
 */
export const validateCNPJ = (
  cnpj: string,
  required: boolean = false
): { valid: boolean; error?: string } => {
  const cleaned = cnpj.replace(/\D/g, "");

  if (!cleaned) {
    if (required) {
      return { valid: false, error: "CNPJ é obrigatório" };
    }
    return { valid: true };
  }

  if (cleaned.length !== 14) {
    return { valid: false, error: "CNPJ deve ter 14 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return { valid: false, error: "CNPJ inválido" };
  }

  // Validação dos dígitos verificadores
  let length = cleaned.length - 2;
  let numbers = cleaned.substring(0, length);
  const digits = cleaned.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return { valid: false, error: "CNPJ inválido" };
  }

  length = length + 1;
  numbers = cleaned.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return { valid: false, error: "CNPJ inválido" };
  }

  return { valid: true };
};

// ===== VALIDAÇÕES DE ARQUIVO =====

/**
 * Valida tamanho de arquivo (em bytes)
 */
export const validateFileSize = (
  size: number,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (size > maxSizeBytes) {
    return { valid: false, error: `Arquivo deve ter no máximo ${maxSizeMB}MB` };
  }

  return { valid: true };
};

/**
 * Valida tipo de arquivo de imagem
 */
export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Formato de imagem não suportado. Use JPG, PNG, GIF ou WEBP",
    };
  }

  return validateFileSize(file.size, 5);
};

/**
 * Valida tipo de arquivo de vídeo
 */
export const validateVideoFile = (
  file: File
): { valid: boolean; error?: string } => {
  const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Formato de vídeo não suportado. Use MP4, WEBM ou OGG",
    };
  }

  return validateFileSize(file.size, 50); // Vídeos podem ser maiores
};

/**
 * Valida tipo de arquivo de documento
 */
export const validateDocumentFile = (
  file: File
): { valid: boolean; error?: string } => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error:
        "Formato de documento não suportado. Use PDF, DOC, DOCX, XLS ou XLSX",
    };
  }

  return validateFileSize(file.size, 10);
};

// ===== VALIDAÇÕES COMPOSTAS =====

/**
 * Valida dados de projeto
 */
export const validateProject = (data: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  client: string;
  budget: number;
  labor?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const nameValidation = validateName(data.name);
  if (!nameValidation.valid) errors.push(nameValidation.error!);

  const descValidation = validateDescription(data.description, false, 500);
  if (!descValidation.valid) errors.push(descValidation.error!);

  const clientValidation = validateName(data.client);
  if (!clientValidation.valid)
    errors.push(`Cliente: ${clientValidation.error}`);

  const dateRangeValidation = validateDateRange(data.startDate, data.endDate);
  if (!dateRangeValidation.valid) errors.push(dateRangeValidation.error!);

  const budgetValidation = validateMoney(data.budget, "Orçamento");
  if (!budgetValidation.valid) errors.push(budgetValidation.error!);

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de item de estoque
 */
export const validateInventoryItem = (data: {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  unitPrice: number;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const nameValidation = validateName(data.name);
  if (!nameValidation.valid) errors.push(nameValidation.error!);

  const categoryValidation = validateName(data.category);
  if (!categoryValidation.valid)
    errors.push(`Categoria: ${categoryValidation.error}`);

  if (!data.unit || data.unit.trim() === "") {
    errors.push("Unidade é obrigatória");
  }

  const qtyValidation = validateQuantity(data.quantity, "Quantidade", 0);
  if (!qtyValidation.valid) errors.push(qtyValidation.error!);

  const minStockValidation = validateQuantity(
    data.minStock,
    "Estoque mínimo",
    0
  );
  if (!minStockValidation.valid) errors.push(minStockValidation.error!);

  const priceValidation = validateMoney(
    data.unitPrice,
    "Preço unitário",
    false,
    0
  );
  if (!priceValidation.valid) errors.push(priceValidation.error!);

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de membro da equipe
 */
export const validateTeamMember = (data: {
  name: string;
  role: string;
  cpf?: string;
  phone?: string;
  hourlyRate?: number;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const nameValidation = validateName(data.name);
  if (!nameValidation.valid) errors.push(nameValidation.error!);

  const roleValidation = validateName(data.role);
  if (!roleValidation.valid) errors.push(`Função: ${roleValidation.error}`);

  if (data.cpf) {
    const cpfValidation = validateCPF(data.cpf);
    if (!cpfValidation.valid) errors.push(cpfValidation.error!);
  }

  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.valid) errors.push(phoneValidation.error!);
  }

  if (data.hourlyRate !== undefined && data.hourlyRate !== null) {
    const rateValidation = validateMoney(
      data.hourlyRate,
      "Valor hora",
      false,
      0
    );
    if (!rateValidation.valid) errors.push(rateValidation.error!);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de fornecedor
 */
export const validateSupplier = (data: {
  name: string;
  category: string;
  contact: string;
  phone?: string;
  email?: string;
  cnpj?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const nameValidation = validateName(data.name);
  if (!nameValidation.valid) errors.push(nameValidation.error!);

  const categoryValidation = validateName(data.category);
  if (!categoryValidation.valid)
    errors.push(`Categoria: ${categoryValidation.error}`);

  const contactValidation = validateName(data.contact);
  if (!contactValidation.valid)
    errors.push(`Contato: ${contactValidation.error}`);

  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.valid) errors.push(phoneValidation.error!);
  }

  if (data.email) {
    const emailValidation = validateEmail(data.email, false);
    if (!emailValidation.valid) errors.push(emailValidation.error!);
  }

  if (data.cnpj) {
    const cnpjValidation = validateCNPJ(data.cnpj);
    if (!cnpjValidation.valid) errors.push(cnpjValidation.error!);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Remove caracteres especiais perigosos de strings
 */
export const sanitizeForDatabase = <T>(obj: T): T => {
  if (typeof obj === "string") {
    return sanitizeText(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForDatabase) as T;
  }

  if (obj && typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj) {
      sanitized[key] = sanitizeForDatabase(obj[key]);
    }
    return sanitized as T;
  }

  return obj;
};

/**
 * Validação genérica de campos obrigatórios
 */
export const validateRequired = (
  value: string | number | boolean | null | undefined,
  fieldName: string
): { valid: boolean; error?: string } => {
  if (value === null || value === undefined || value === "") {
    return { valid: false, error: `${fieldName} é obrigatório` };
  }

  if (typeof value === "string" && value.trim() === "") {
    return { valid: false, error: `${fieldName} é obrigatório` };
  }

  return { valid: true };
};

/**
 * Valida dados de equipamento
 */
export const validateEquipment = (data: {
  name: string;
  type: string;
  status?: string;
  location?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const nameValidation = validateName(data.name);
  if (!nameValidation.valid) errors.push(nameValidation.error!);

  const typeValidation = validateName(data.type);
  if (!typeValidation.valid) errors.push(`Tipo: ${typeValidation.error}`);

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de agendamento/cronograma
 */
export const validateSchedule = (data: {
  taskName: string;
  startDate: string;
  endDate: string;
  progress?: number;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const nameValidation = validateName(data.taskName);
  if (!nameValidation.valid)
    errors.push(`Nome da tarefa: ${nameValidation.error}`);

  const dateRangeValidation = validateDateRange(data.startDate, data.endDate);
  if (!dateRangeValidation.valid) errors.push(dateRangeValidation.error!);

  if (data.progress !== undefined) {
    const progressValidation = validatePercentage(data.progress, "Progresso");
    if (!progressValidation.valid) errors.push(progressValidation.error!);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de registro de segurança
 */
export const validateSafetyRecord = (data: {
  title: string;
  description: string;
  date: string;
  severity?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const titleValidation = validateName(data.title);
  if (!titleValidation.valid) errors.push(`Título: ${titleValidation.error}`);

  const descValidation = validateDescription(data.description, true, 2000);
  if (!descValidation.valid) errors.push(descValidation.error!);

  const dateValidation = validateDate(data.date, "Data");
  if (!dateValidation.valid) errors.push(dateValidation.error!);

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de medição
 */
export const validateMeasurement = (data: {
  title: string;
  quantity: number;
  unit: string;
  date: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const titleValidation = validateName(data.title);
  if (!titleValidation.valid) errors.push(`Título: ${titleValidation.error}`);

  const qtyValidation = validatePositiveNumber(
    data.quantity,
    "Quantidade",
    true
  );
  if (!qtyValidation.valid) errors.push(qtyValidation.error!);

  if (!data.unit || data.unit.trim() === "") {
    errors.push("Unidade é obrigatória");
  }

  const dateValidation = validateDate(data.date, "Data");
  if (!dateValidation.valid) errors.push(dateValidation.error!);

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de problema/issue
 */
export const validateIssue = (data: {
  title: string;
  description: string;
  priority?: string;
  status?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const titleValidation = validateName(data.title);
  if (!titleValidation.valid) errors.push(`Título: ${titleValidation.error}`);

  const descValidation = validateDescription(data.description, true, 2000);
  if (!descValidation.valid) errors.push(descValidation.error!);

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de documento
 */
export const validateDocument = (data: {
  title: string;
  type: string;
  description?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const titleValidation = validateName(data.title);
  if (!titleValidation.valid) errors.push(`Título: ${titleValidation.error}`);

  const typeValidation = validateName(data.type);
  if (!typeValidation.valid) errors.push(`Tipo: ${typeValidation.error}`);

  if (data.description) {
    const descValidation = validateDescription(data.description, false, 1000);
    if (!descValidation.valid) errors.push(descValidation.error!);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de checklist de qualidade
 */
export const validateQualityChecklist = (data: {
  title: string;
  description: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const titleValidation = validateName(data.title);
  if (!titleValidation.valid) errors.push(`Título: ${titleValidation.error}`);

  const descValidation = validateDescription(data.description, false, 1000);
  if (!descValidation.valid) errors.push(descValidation.error!);

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de relatório (RDO, Gastos, etc)
 */
export const validateReport = (data: {
  obraName: string;
  date: string;
  projectId: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const nameValidation = validateName(data.obraName);
  if (!nameValidation.valid)
    errors.push(`Nome da obra: ${nameValidation.error}`);

  const dateValidation = validateDate(data.date, "Data do relatório");
  if (!dateValidation.valid) errors.push(dateValidation.error!);

  if (!data.projectId || data.projectId.trim() === "") {
    errors.push("É necessário vincular o relatório a uma obra");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
