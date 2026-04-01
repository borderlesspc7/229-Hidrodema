import type { FirebaseError } from 'firebase/app'

export function firebaseAuthMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/invalid-credential':
      'E-mail ou senha incorretos. Verifique os dados.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/user-not-found': 'Não encontramos conta com este e-mail.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres.',
    'auth/too-many-requests':
      'Muitas tentativas. Tente novamente em instantes.',
    'auth/network-request-failed':
      'Falha de rede. Verifique sua conexão.',
    'auth/operation-not-allowed':
      'Login por e-mail não está habilitado no projeto Firebase.',
    'permission-denied':
      'Não foi possível salvar o cadastro. O CPF/CNPJ pode já estar em uso.',
    'firestore/permission-denied':
      'Não foi possível salvar o cadastro. O CPF/CNPJ pode já estar em uso.',
  }
  return map[code] ?? 'Ocorreu um erro. Tente novamente.'
}

export function getFirebaseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as FirebaseError).code)
    return firebaseAuthMessage(code)
  }
  return 'Ocorreu um erro inesperado.'
}
