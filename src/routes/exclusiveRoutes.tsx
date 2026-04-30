import { Route, Routes } from "react-router-dom";
import SolicitacaoServicos from "../pages/AcessoExclusivo/SolicitacaoServicos/SolicitacaoServicos";
import RelatorioVisitas from "../pages/AcessoExclusivo/RelatorioVisitas/RelatorioVisitas";
import EqualizadorServicos from "../pages/AcessoExclusivo/EqualizadorServicos/EqualizadorServicos";
import GestaoVendedores from "../pages/AcessoExclusivo/GestaoVendedores/GestaoVendedores";
import GerenciamentoObras from "../pages/AcessoExclusivo/GerenciamentoObras/GerenciamentoObras";
import ControleFuncionarios from "../pages/AcessoExclusivo/ControleFuncionarios/ControleFuncionarios";
import DashboardPerformance from "../pages/AcessoExclusivo/DashboardPerformance/DashboardPerformance";
import { RoleRoute } from "./RoleRoute";
import MedicoesPage from "../pages/AcessoExclusivo/GerenciamentoObras/MedicoesPage/MedicoesPage";
import ProblemasPage from "../pages/AcessoExclusivo/GerenciamentoObras/ProblemasPage/ProblemasPage";
import DocumentosPage from "../pages/AcessoExclusivo/GerenciamentoObras/DocumentosPage/DocumentosPage";
/**
 * Estas rotas ficam sob <Route path="/acesso-exclusivo/*" />.
 * O React Router passa para o <Routes> filho apenas o pathname *restante*
 * (ex.: /gerenciamento-obras), não a URL completa — por isso os paths aqui
 * são relativos a /acesso-exclusivo/, sem esse prefixo.
 */
export default function ExclusiveRoutes() {
  return (
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
    </Routes>
  );
}
