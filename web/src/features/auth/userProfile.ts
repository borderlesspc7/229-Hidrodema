export type AccountKind = 'pf' | 'pj'

export type UserProfile = {
  kind: AccountKind
  document: string
  name: string
  tradeName?: string
  email: string
  phone: string
  localizacao?: string
  cidade?: string
  estado?: string
  role?: 'funcionario_cliente' | 'admin' | string
  funcao?: string
  locadoraId?: string
}
