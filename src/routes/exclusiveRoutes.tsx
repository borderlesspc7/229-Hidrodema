import { Route, Routes } from "react-router-dom";
import SolicitacaoServicos from "../pages/AcessoExclusivo/SolicitacaoServicos/SolicitacaoServicos";
import RelatorioVisitas from "../pages/AcessoExclusivo/RelatorioVisitas/RelatorioVisitas";
import EqualizadorServicos from "../pages/AcessoExclusivo/EqualizadorServicos/EqualizadorServicos";

export default function ExclusiveRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<div>Acesso Exclusivo Home - Lista das 5 opções</div>}
      />
      <Route path="/relatorio-visitas" element={<RelatorioVisitas />} />
      <Route
        path="/gerenciamento-obra"
        element={<div>Gerenciamento de Obra</div>}
      />
      <Route path="/equalizador-servico" element={<EqualizadorServicos />} />
      <Route path="/solicitacao-servicos" element={<SolicitacaoServicos />} />
    </Routes>
  );
}
