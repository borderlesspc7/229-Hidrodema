/** Apenas dígitos. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11)
  const p1 = d.slice(0, 3)
  const p2 = d.slice(3, 6)
  const p3 = d.slice(6, 9)
  const p4 = d.slice(9, 11)
  if (d.length <= 3) return p1
  if (d.length <= 6) return `${p1}.${p2}`
  if (d.length <= 9) return `${p1}.${p2}.${p3}`
  return `${p1}.${p2}.${p3}-${p4}`
}

export function formatCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14)
  const p1 = d.slice(0, 2)
  const p2 = d.slice(2, 5)
  const p3 = d.slice(5, 8)
  const p4 = d.slice(8, 12)
  const p5 = d.slice(12, 14)
  if (d.length <= 2) return p1
  if (d.length <= 5) return `${p1}.${p2}`
  if (d.length <= 8) return `${p1}.${p2}.${p3}`
  if (d.length <= 12) return `${p1}.${p2}.${p3}/${p4}`
  return `${p1}.${p2}.${p3}/${p4}-${p5}`
}

function cpfCheckDigit(base: string, factor: number): number {
  let sum = 0
  for (let i = 0; i < base.length; i++) {
    sum += Number(base[i]!) * factor--
  }
  const mod = (sum * 10) % 11
  return mod === 10 ? 0 : mod
}

export function isValidCpf(raw: string): boolean {
  const d = onlyDigits(raw)
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  const d1 = cpfCheckDigit(d.slice(0, 9), 10)
  const d2 = cpfCheckDigit(d.slice(0, 9) + String(d1), 11)
  return d1 === Number(d[9]) && d2 === Number(d[10])
}

const CNPJ_WEIGHTS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const
const CNPJ_WEIGHTS_2 = [6, ...CNPJ_WEIGHTS_1] as const

function cnpjDigit(base: string, weights: readonly number[]): number {
  let sum = 0
  for (let i = 0; i < weights.length; i++) {
    sum += Number(base[i]!) * weights[i]!
  }
  const mod = sum % 11
  return mod < 2 ? 0 : 11 - mod
}

export function isValidCnpj(raw: string): boolean {
  const d = onlyDigits(raw)
  if (d.length !== 14) return false
  if (/^(\d)\1{13}$/.test(d)) return false
  const first = cnpjDigit(d.slice(0, 12), CNPJ_WEIGHTS_1)
  const second = cnpjDigit(d.slice(0, 12) + String(first), CNPJ_WEIGHTS_2)
  return first === Number(d[12]) && second === Number(d[13])
}
