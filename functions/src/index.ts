import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

const db = getFirestore()
const adminAuth = getAuth()

type CreateClienteUsuarioPayload = {
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

type CreateProfissionalUsuarioPayload = {
  nome: string
  cpf: string
  email: string
  celular: string
  localizacao: string
  cidade: string
  estado: string
  password: string
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function assertRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpsError('invalid-argument', `Campo obrigatório: ${field}.`)
  }
  return value.trim()
}

function mapFirebaseError(err: unknown): HttpsError {
  const code =
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code?: string }).code === 'string'
      ? (err as { code: string }).code
      : ''

  if (code === 'auth/email-already-exists') {
    return new HttpsError('already-exists', 'E-mail já está em uso.')
  }
  if (code === 'auth/uid-already-exists') {
    return new HttpsError('already-exists', 'Usuário já existe.')
  }
  return new HttpsError('internal', 'Não foi possível criar o cliente.')
}

function parseCommonPayload(data: {
  nome?: unknown
  cpf?: unknown
  email?: unknown
  celular?: unknown
  localizacao?: unknown
  cidade?: unknown
  estado?: unknown
  password?: unknown
}) {
  const nome = assertRequiredString(data.nome, 'nome')
  const cpf = onlyDigits(assertRequiredString(data.cpf, 'cpf'))
  const email = assertRequiredString(data.email, 'email').toLowerCase()
  const celular = onlyDigits(assertRequiredString(data.celular, 'celular'))
  const localizacao = assertRequiredString(data.localizacao, 'localizacao')
  const cidade = assertRequiredString(data.cidade, 'cidade')
  const estado = assertRequiredString(data.estado, 'estado').toUpperCase()
  const password = assertRequiredString(data.password, 'password')

  if (cpf.length !== 11) {
    throw new HttpsError('invalid-argument', 'CPF inválido.')
  }
  if (password.length < 6) {
    throw new HttpsError(
      'invalid-argument',
      'Senha deve ter pelo menos 6 caracteres.',
    )
  }

  return { nome, cpf, email, celular, localizacao, cidade, estado, password }
}

export const createClienteUsuario = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'É necessário estar autenticado.')
    }

    const data = request.data as Partial<CreateClienteUsuarioPayload>

    const { nome, cpf, email, celular, localizacao, cidade, estado, password } =
      parseCommonPayload(data)
    const funcao = assertRequiredString(data.funcao, 'funcao')

    let uid: string | null = null
    try {
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: nome,
      })
      uid = userRecord.uid

      const batch = db.batch()
      batch.create(db.collection('documentRegistry').doc(cpf), { uid })
      batch.set(db.collection('users').doc(uid), {
        kind: 'pf',
        role: 'funcionario_cliente',
        funcao,
        document: cpf,
        name: nome,
        tradeName: null,
        email,
        phone: celular,
        localizacao,
        cidade,
        estado,
        locadoraId: null,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request.auth.uid,
      })

      await batch.commit()

      return { uid, email }
    } catch (err) {
      if (uid) {
        await adminAuth.deleteUser(uid).catch(() => undefined)
      }
      throw mapFirebaseError(err)
    }
  },
)

export const createProfissionalUsuario = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'É necessário estar autenticado.')
    }

    const data = request.data as Partial<CreateProfissionalUsuarioPayload>
    const { nome, cpf, email, celular, localizacao, cidade, estado, password } =
      parseCommonPayload(data)

    let uid: string | null = null
    try {
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: nome,
      })
      uid = userRecord.uid

      const batch = db.batch()
      batch.create(db.collection('documentRegistry').doc(cpf), { uid })
      batch.set(db.collection('users').doc(uid), {
        kind: 'pf',
        role: 'profissional',
        funcao: 'Profissional',
        document: cpf,
        name: nome,
        tradeName: null,
        email,
        phone: celular,
        localizacao,
        cidade,
        estado,
        locadoraId: null,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request.auth.uid,
      })
      batch.set(db.collection('profissionais').doc(uid), {
        nome,
        cpf,
        email,
        telefone: celular,
        localizacao,
        cidade,
        estado,
        status: 'pendente',
        saldoTaxaHabilitacao: 0,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request.auth.uid,
      })

      await batch.commit()
      return { uid, email }
    } catch (err) {
      if (uid) {
        await adminAuth.deleteUser(uid).catch(() => undefined)
      }
      throw mapFirebaseError(err)
    }
  },
)
