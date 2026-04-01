import { useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { useAuth } from '@/features/auth/AuthContext'
import { getFirebaseErrorMessage } from '@/features/auth/firebaseErrors'
import { registerUserWithProfile } from '@/features/auth/registerUserProfile'
import {
  formatCnpj,
  formatCpf,
  isValidCnpj,
  isValidCpf,
  onlyDigits,
} from '@/lib/brDocuments'

type MainTab = 'login' | 'register'

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, signIn } = useAuth()
  const [mainTab, setMainTab] = useState<MainTab>('login')
  const [registerKind, setRegisterKind] = useState<'pf' | 'pj'>('pf')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  const [regName, setRegName] = useState('')
  const [regTradeName, setRegTradeName] = useState('')
  const [regDoc, setRegDoc] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regLocalizacao, setRegLocalizacao] = useState('')
  const [regCidade, setRegCidade] = useState('')
  const [regEstado, setRegEstado] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState<string | null>(null)
  const [regSuccess, setRegSuccess] = useState<string | null>(null)
  const [regSubmitting, setRegSubmitting] = useState(false)

  const state = location.state as { from?: string } | undefined
  const rawFrom = state?.from
  const from =
    rawFrom && rawFrom !== '/entrar' ? rawFrom : '/'

  if (!loading && user) {
    return <Navigate to={from ?? '/'} replace />
  }

  async function onLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginError(null)
    if (!loginEmail.trim() || loginPassword.length < 6) {
      setLoginError('Informe e-mail e senha (mín. 6 caracteres).')
      return
    }
    setLoginSubmitting(true)
    try {
      await signIn(loginEmail, loginPassword)
      navigate(from ?? '/', { replace: true })
    } catch (err) {
      setLoginError(getFirebaseErrorMessage(err))
    } finally {
      setLoginSubmitting(false)
    }
  }

  async function onRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setRegError(null)
    setRegSuccess(null)

    const docDigits = onlyDigits(regDoc)
    if (registerKind === 'pf') {
      if (!isValidCpf(regDoc)) {
        setRegError('CPF inválido.')
        return
      }
    } else {
      if (!isValidCnpj(regDoc)) {
        setRegError('CNPJ inválido.')
        return
      }
    }

    if (regPassword !== regConfirm) {
      setRegError('Senhas não conferem.')
      return
    }
    if (regPassword.length < 6) {
      setRegError('Senha com no mínimo 6 caracteres.')
      return
    }

    setRegSubmitting(true)
    try {
      await registerUserWithProfile({
        kind: registerKind,
        document: docDigits,
        name: regName,
        tradeName: registerKind === 'pj' ? regTradeName : undefined,
        email: regEmail,
        phone: regPhone,
        localizacao: regLocalizacao,
        cidade: regCidade,
        estado: regEstado,
        password: regPassword,
      })
      setRegSuccess(
        'Conta criada. Você já está autenticado; redirecionando ao painel…',
      )
      setRegName('')
      setRegTradeName('')
      setRegDoc('')
      setRegEmail('')
      setRegPhone('')
      setRegLocalizacao('')
      setRegCidade('')
      setRegEstado('')
      setRegPassword('')
      setRegConfirm('')
      navigate(from ?? '/', { replace: true })
    } catch (err) {
      setRegError(getFirebaseErrorMessage(err))
    } finally {
      setRegSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#141f30] px-6 py-10">
      <div className="mb-10 flex w-full max-w-lg flex-col items-center gap-3 text-left">
        <img
          src="/logo-cristal-drynexis.png"
          alt="cristal DryNexis"
          className="h-auto w-auto max-h-40 max-w-[min(100%,560px)] object-contain object-center drop-shadow-lg sm:max-h-48"
        />
        <p className="text-sm text-slate-300">
          Acesso com Firebase · perfil em Firestore
        </p>
      </div>

      <Card className="w-full max-w-lg border-slate-200/80 shadow-xl">
        <div className="border-b border-slate-100 p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setMainTab('login')
                setLoginError(null)
              }}
              className={cn(
                'rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                mainTab === 'login'
                  ? 'bg-brand-accent text-brand-navy shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50',
              )}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMainTab('register')
                setRegError(null)
              }}
              className={cn(
                'rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                mainTab === 'register'
                  ? 'bg-brand-accent text-brand-navy shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50',
              )}
            >
              Criar conta
            </button>
          </div>
        </div>

        <div className="p-6">
          {mainTab === 'login' ? (
            <form className="space-y-4" onSubmit={onLoginSubmit}>
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-slate-600"
                  htmlFor="auth-email"
                >
                  E-mail
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-slate-600"
                  htmlFor="auth-password"
                >
                  Senha
                </label>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              {loginError ? (
                <p className="text-sm text-red-600" role="alert">
                  {loginError}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full py-2.5"
                disabled={loginSubmitting}
              >
                {loginSubmitting ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={onRegisterSubmit}>
              <div className="flex rounded-lg border border-slate-200 p-1">
                <button
                  type="button"
                  className={cn(
                    'flex-1 rounded-md px-2 py-2 text-xs font-semibold sm:text-sm',
                    registerKind === 'pf'
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                  onClick={() => {
                    setRegisterKind('pf')
                    setRegDoc('')
                    setRegError(null)
                  }}
                >
                  Pessoa física (CPF)
                </button>
                <button
                  type="button"
                  className={cn(
                    'flex-1 rounded-md px-2 py-2 text-xs font-semibold sm:text-sm',
                    registerKind === 'pj'
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                  onClick={() => {
                    setRegisterKind('pj')
                    setRegDoc('')
                    setRegError(null)
                  }}
                >
                  Pessoa jurídica (CNPJ)
                </button>
              </div>

              {registerKind === 'pj' ? (
                <>
                  <div>
                    <label
                      className="mb-1 block text-xs font-medium text-slate-600"
                      htmlFor="reg-trade"
                    >
                      Nome fantasia
                    </label>
                    <input
                      id="reg-trade"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                      value={regTradeName}
                      onChange={(e) => setRegTradeName(e.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-xs font-medium text-slate-600"
                      htmlFor="reg-name-pj"
                    >
                      Razão social
                    </label>
                    <input
                      id="reg-name-pj"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-xs font-medium text-slate-600"
                      htmlFor="reg-doc-pj"
                    >
                      CNPJ
                    </label>
                    <input
                      id="reg-doc-pj"
                      required
                      inputMode="numeric"
                      autoComplete="off"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                      value={regDoc}
                      onChange={(e) => setRegDoc(formatCnpj(e.target.value))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label
                      className="mb-1 block text-xs font-medium text-slate-600"
                      htmlFor="reg-name-pf"
                    >
                      Nome completo
                    </label>
                    <input
                      id="reg-name-pf"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-xs font-medium text-slate-600"
                      htmlFor="reg-doc-pf"
                    >
                      CPF
                    </label>
                    <input
                      id="reg-doc-pf"
                      required
                      inputMode="numeric"
                      autoComplete="off"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                      value={regDoc}
                      onChange={(e) => setRegDoc(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  className="mb-1 block text-xs font-medium text-slate-600"
                  htmlFor="reg-email"
                >
                  E-mail
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-slate-600"
                  htmlFor="reg-phone"
                >
                  Telefone
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  inputMode="tel"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-slate-600"
                  htmlFor="reg-localizacao"
                >
                  Localização
                </label>
                <input
                  id="reg-localizacao"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                  value={regLocalizacao}
                  onChange={(e) => setRegLocalizacao(e.target.value)}
                  placeholder="Bairro, região ou referência"
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-slate-600"
                  htmlFor="reg-cidade"
                >
                  Cidade
                </label>
                <input
                  id="reg-cidade"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                  value={regCidade}
                  onChange={(e) => setRegCidade(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-slate-600"
                  htmlFor="reg-estado"
                >
                  Estado (UF)
                </label>
                <input
                  id="reg-estado"
                  type="text"
                  required
                  maxLength={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                  value={regEstado}
                  onChange={(e) => setRegEstado(e.target.value.toUpperCase())}
                  placeholder="SP"
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-slate-600"
                  htmlFor="reg-pass"
                >
                  Senha
                </label>
                <input
                  id="reg-pass"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-xs font-medium text-slate-600"
                  htmlFor="reg-pass2"
                >
                  Confirmar senha
                </label>
                <input
                  id="reg-pass2"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-accent/30 focus:border-brand-accent focus:ring-2"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                />
              </div>

              {regError ? (
                <p className="text-sm text-red-600" role="alert">
                  {regError}
                </p>
              ) : null}
              {regSuccess ? (
                <p className="text-sm text-emerald-700" role="status">
                  {regSuccess}
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full py-2.5"
                disabled={regSubmitting}
              >
                {regSubmitting ? 'Criando…' : 'Criar conta'}
              </Button>
            </form>
          )}
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-slate-400">
        <Link
          to="/"
          className="font-medium text-brand-accent underline-offset-2 hover:underline"
        >
          Ir ao painel
        </Link>
      </p>
    </div>
  )
}
