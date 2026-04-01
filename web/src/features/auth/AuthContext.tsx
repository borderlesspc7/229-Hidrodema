import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { getDb, getFirebaseAuth } from '@/lib/firebase'
import type { UserProfile } from '@/features/auth/userProfile'

type AuthState = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOutUser: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function mapProfile(data: Record<string, unknown>): UserProfile {
  return {
    kind: data.kind === 'pj' ? 'pj' : 'pf',
    document: String(data.document ?? ''),
    name: String(data.name ?? ''),
    tradeName:
      data.tradeName != null && data.tradeName !== ''
        ? String(data.tradeName)
        : undefined,
    email: String(data.email ?? ''),
    phone: String(data.phone ?? ''),
    localizacao:
      data.localizacao != null && data.localizacao !== ''
        ? String(data.localizacao)
        : undefined,
    cidade:
      data.cidade != null && data.cidade !== '' ? String(data.cidade) : undefined,
    estado:
      data.estado != null && data.estado !== '' ? String(data.estado) : undefined,
    role:
      data.role != null && data.role !== '' ? String(data.role) : undefined,
    funcao:
      data.funcao != null && data.funcao !== ''
        ? String(data.funcao)
        : undefined,
    locadoraId:
      data.locadoraId != null && data.locadoraId !== ''
        ? String(data.locadoraId)
        : undefined,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null)
      return
    }
    const snap = await getDoc(doc(getDb(), 'users', u.uid))
    if (!snap.exists()) {
      setProfile(null)
      return
    }
    setProfile(mapProfile(snap.data() as Record<string, unknown>))
  }, [])

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, async (next) => {
      setUser(next)
      await loadProfile(next)
      setLoading(false)
    })
    return () => unsub()
  }, [loadProfile])

  const handleSignIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    )
  }, [])

  const signOutUser = useCallback(async () => {
    const auth = getFirebaseAuth()
    await signOut(auth)
  }, [])

  const refreshProfile = useCallback(async () => {
    await loadProfile(user)
  }, [loadProfile, user])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signIn: handleSignIn,
      signOutUser,
      refreshProfile,
    }),
    [user, profile, loading, handleSignIn, signOutUser, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- useAuth colocated with AuthProvider
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
