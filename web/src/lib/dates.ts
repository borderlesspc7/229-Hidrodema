export function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function parseISODateOnly(iso: string): Date {
  const [y, m, day] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, day ?? 1)
}

export function eachDayInclusive(from: Date, to: Date): Date[] {
  const a = startOfDay(from)
  const b = startOfDay(to)
  const out: Date[] = []
  for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
    out.push(new Date(d))
  }
  return out
}
