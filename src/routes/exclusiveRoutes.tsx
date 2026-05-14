import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import PageLoading from "../components/PageLoading";
import { RoleRoute } from "./RoleRoute";

const SolicitacaoServicos = lazy(() => import("../pages/AcessoExclusivo/SolicitacaoServicos/SolicitacaoServicos"));
const RelatorioVisitas = lazy(() => import("../pages/AcessoExclusivo/RelatorioVisitas/RelatorioVisitas"));
const EqualizadorServicos = lazy(() => import("../pages/AcessoExclusivo/EqualizadorServicos/EqualizadorServicos"));
const GestaoVendedores = lazy(() => import("../pages/AcessoExclusivo/GestaoVendedores/GestaoVendedores"));
const GerenciamentoObras = lazy(() => import("../pages/AcessoExclusivo/GerenciamentoObras/GerenciamentoObras"));
const ControleFuncionarios = lazy(() => import("../pages/AcessoExclusivo/ControleFuncionarios/ControleFuncionarios"));
const DashboardPerformance = lazy(() => import("../pages/AcessoExclusivo/DashboardPerformance/DashboardPerformance"));
const VinculoTecnico = lazy(() => import("../pages/AcessoExclusivo/VinculoTecnico/VinculoTecnico"));
const ConfiguracaoFormularios = lazy(() => import("../pages/AcessoExclusivo/ConfiguracaoFormularios/ConfiguracaoFormularios"));
const MinhasTarefas = lazy(() => import("../pages/AcessoExclusivo/MinhasTarefas/MinhasTarefas"));
const MedicoesPage = lazy(() => import("../pages/AcessoExclusivo/GerenciamentoObras/MedicoesPage/MedicoesPage"));
const ProblemasPage = lazy(() => import("../pages/AcessoExclusivo/GerenciamentoObras/ProblemasPage/ProblemasPage"));
const DocumentosPage = lazy(() => import("../pages/AcessoExclusivo/GerenciamentoObras/DocumentosPage/DocumentosPage"));
/**
 * Rotas relativas ao prefixo `/acesso-exclusivo/` (definidas como filhas em `AppRoutes.tsx`).
 */
export default function ExclusiveRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="relatorio-visitas" element={<RelatorioVisitas />} />
      <Route path="gerenciamento-obras" element={<GerenciamentoObras />} />
      <Route
        path="gerenciamento-obras/medicoes"
        element={<MedicoesPage />}
      />
      <Route
        path="gerenciamento-obras/problemas"
        element={<ProblemasPage />}
      />
      <Route
        path="gerenciamento-obras/documentos"
        element={<DocumentosPage />}
      />
      <Route path="equalizador-servico" element={<EqualizadorServicos />} />
      <Route path="solicitacao-servicos" element={<SolicitacaoServicos />} />
      <Route path="minhas-tarefas" element={<MinhasTarefas />} />
      <Route
        path="dashboard-performance"
        element={
          <RoleRoute allow={["admin", "gestor"]}>
            <DashboardPerformance />
          </RoleRoute>
        }
      />
      <Route
        path="controle-funcionarios"
        element={
          <RoleRoute allow={["admin"]}>
            <ControleFuncionarios />
          </RoleRoute>
        }
      />
      <Route
        path="gestao-vendedores"
        element={
          <RoleRoute allow={["admin", "gestor"]}>
            <GestaoVendedores />
          </RoleRoute>
        }
      />
      <Route
        path="vinculo-tecnico"
        element={
          <RoleRoute allow={["admin", "gestor"]}>
            <VinculoTecnico />
          </RoleRoute>
        }
      />
        <Route
          path="configuracao-formularios"
          element={
            <RoleRoute allow={["admin", "gestor"]}>
              <ConfiguracaoFormularios />
            </RoleRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
