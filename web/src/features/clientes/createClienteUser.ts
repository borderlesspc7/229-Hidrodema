import { getFunctions, httpsCallable } from 'firebase/functions'
import type { FirebaseError } from 'firebase/app'
import { getFirebaseApp } from '@/lib/firebase'

type CreateClientePayload = {
  nome: string
  cpf: string
  email: string
  celular: string
  funcao: string
  localizacao: string
  cidade: string
  estado: string
  password: string
}

type CreateClienteResponse = {
  uid: string
  email: string
}

function getCallableFunctions() {
  const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION
  return getFunctions(getFirebaseApp(), region || 'southamerica-east1')
}

function mapFunctionError(code: string): string {
  const map: Record<string, string> = {
    'functions/already-exists': 'E-mail já está em uso.',
    'functions/invalid-argument': 'Dados inválidos. Revise os campos.',
    'functions/unauthenticated':
      'Sua sessão expirou. Entre novamente para continuar.',
    'functions/permission-denied':
      'Você não tem permissão para criar clientes.',
    'functions/internal': 'Não foi possível criar o cliente no momento.',
  }
  return map[code] ?? 'Não foi possível criar o cliente.'
}

export function getCreateClienteErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    return mapFunctionError(String((err as FirebaseError).code))
  }
  return 'Ocorreu um erro inesperado.'
}

export async function createClienteUsuario(input: CreateClientePayload) {
  const callable = httpsCallable<CreateClientePayload, CreateClienteResponse>(
    getCallableFunctions(),
    'createClienteUsuario',
  )
  const result = await callable(input)
  return result.data
}
