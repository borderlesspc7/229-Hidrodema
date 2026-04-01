import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  UserRoundPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/features/auth/AuthContext'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/locadoras', label: 'Locadoras', icon: Building2 },
  { to: '/profissionais', label: 'Profissionais', icon: Users },
  { to: '/clientes', label: 'Clientes', icon: UserRoundPlus },
  { to: '/chamados', label: 'Chamados', icon: ClipboardList },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

function titleFromPath(pathname: string): string {
  const item = nav.find((n) =>
    n.end ? pathname === '/' : pathname.startsWith(n.to),
  )
  return item?.label ?? 'Admin'
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = titleFromPath(location.pathname)
  const { profile, user, signOutUser } = useAuth()
  const displayName = profile?.name ?? user?.email ?? 'Usuário'
  const docLine =
    profile &&
    `${profile.kind === 'pf' ? 'CPF' : 'CNPJ'} · ${profile.document}`

  return (
    <div className="flex min-h-dvh">
      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-brand-navy text-slate-200 transition-transform duration-200 md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="relative flex min-h-[5.5rem] items-center justify-center border-b border-white/10 pl-3 pr-10 py-4 md:pl-3 md:pr-4">
          <img
            src="/logo-cristal-drynexis.png"
            alt="cristal DryNexis"
            className="relative -left-2 h-20 w-auto max-w-[min(100%,260px)] object-contain object-center md:h-24 md:max-w-[300px]"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
                  isActive
                    ? 'bg-brand-accent text-brand-navy shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3 text-xs text-slate-400">
          <p>Gerenciadora · MVP · Firebase</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-brand-navy hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-accent-dark">
              Painel administrativo
            </p>
            <h2 className="truncate text-lg font-semibold text-brand-navy">
              {pageTitle}
            </h2>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div
              className="flex items-center gap-2"
              title="Sessão Firebase Authentication"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-brand-navy">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500">
                  {docLine ?? user?.email ?? 'Cristal DryNexis'}
                </p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent/25 text-sm font-semibold text-brand-navy"
                aria-hidden
              >
                {displayName
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              onClick={async () => {
                await signOutUser()
                navigate('/entrar', { replace: true })
              }}
            >
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
