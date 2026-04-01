import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { getDb, getFirebaseAuth } from '@/lib/firebase'
import type { AccountKind } from '@/features/auth/userProfile'

export async function registerUserWithProfile(input: {
  email: string
  password: string
  kind: AccountKind
  document: string
  name: string
  tradeName?: string
  phone: string
  localizacao: string
  cidade: string
  estado: string
}): Promise<void> {
  const auth = getFirebaseAuth()
  const db = getDb()
  const email = input.email.trim().toLowerCase()
  const cred = await createUserWithEmailAndPassword(
    auth,
    email,
    input.password,
  )
  const uid = cred.user.uid
  const batch = writeBatch(db)
  const userRef = doc(db, 'users', uid)
  const regRef = doc(db, 'documentRegistry', input.document)
  batch.set(userRef, {
    kind: input.kind,
    document: input.document,
    name: input.name.trim(),
    tradeName: input.tradeName?.trim() || null,
    email,
    phone: input.phone.replace(/\D/g, ''),
    localizacao: input.localizacao.trim(),
    cidade: input.cidade.trim(),
    estado: input.estado.trim().toUpperCase(),
    createdAt: serverTimestamp(),
  })
  batch.set(regRef, { uid })
  try {
    await batch.commit()
  } catch (err) {
    await deleteUser(cred.user)
    throw err
  }
}
