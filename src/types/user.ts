/** admin/gestor: visão macro; vendedor/user: dados próprios (visitas/obras escopadas). */
export type UserRole = "admin" | "gestor" | "vendedor" | "user";

export interface User {
  uid: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  role?: UserRole;
  /** Código comercial (ex.: prefixo antes do nome nas listas do formulário). */
  sellerCode?: string;
  /** ID na API externa de vendedores (mapeamento). */
  sellerExternalId?: string;
  /** Agrupamento de hierarquia (regional/filial). */
  regionId?: string;
  /** Agrupamento de hierarquia (time/unidade de negócio). */
  teamId?: string;
  /** Competências/especialidades (para filtros e delegação). */
  specialties?: string[];
  /** Área/descrição curta (opcional). */
  specialtyNote?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  confirmPassword?: string; // Opcional, usado apenas para validação local
  phone?: string;
  role?: UserRole;
}
