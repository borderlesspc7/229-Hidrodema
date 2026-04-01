import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseApp } from '@/lib/firebase'
import type { FirebaseError } from 'firebase/app'

type CreateProfissionalPayload = {
  nome: string
  cpf: string
  email: string
  celular: string
  localizacao: string
  cidade: string
  estado: string
  password: string
}

type CreateProfissionalResponse = {
  uid: string
  email: string
}

function getCallableFunctions() {
  const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION
  return getFunctions(getFirebaseApp(), region || 'southamerica-east1')
}

export function getCreateProfissionalErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as FirebaseError).code)
    const map: Record<string, string> = {
      'functions/already-exists': 'E-mail já está em uso.',
      'functions/invalid-argument': 'Dados inválidos. Revise os campos.',
      'functions/unauthenticated':
        'Sua sessão expirou. Entre novamente para continuar.',
      'functions/permission-denied':
        'Você não tem permissão para criar profissionais.',
      'functions/internal': 'Não foi possível criar o profissional.',
    }
    return map[code] ?? 'Não foi possível criar o profissional.'
  }
  return 'Ocorreu um erro inesperado.'
}

export async function createProfissionalUsuario(input: CreateProfissionalPayload) {
  const callable = httpsCallable<
    CreateProfissionalPayload,
    CreateProfissionalResponse
  >(getCallableFunctions(), 'createProfissionalUsuario')
  const result = await callable(input)
  return result.data
}
