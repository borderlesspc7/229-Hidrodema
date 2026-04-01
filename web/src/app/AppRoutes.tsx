import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { AuthProvider, useAuth } from '@/features/auth/AuthContext'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ChamadosPage } from '@/features/chamados/pages/ChamadosPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { FinanceiroPage } from '@/features/financeiro/pages/FinanceiroPage'
import { ClientesPage } from '@/features/clientes/pages/ClientesPage'
import { LocadoraDetalhePage } from '@/features/locadoras/pages/LocadoraDetalhePage'
import { LocadorasPage } from '@/features/locadoras/pages/LocadorasPage'
import { ProfissionaisPage } from '@/features/profissionais/pages/ProfissionaisPage'
import { ProdutosPage } from '@/features/produtos/pages/ProdutosPage'
import { RelatoriosPage } from '@/features/relatorios/pages/RelatoriosPage'

function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-surface text-brand-navy">
        <p className="text-sm font-medium text-slate-600">Carregando…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

function AppRoutesContent() {
  return (
    <Routes>
      <Route path="/entrar" element={<AuthPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/locadoras" element={<LocadorasPage />} />
          <Route path="/locadoras/:id" element={<LocadoraDetalhePage />} />
          <Route path="/profissionais" element={<ProfissionaisPage />} />
          <Route path="/chamados" element={<ChamadosPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutesContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
