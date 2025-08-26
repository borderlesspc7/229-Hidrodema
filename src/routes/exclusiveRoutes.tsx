import { Route, Routes } from "react-router-dom";

export default function ExclusiveRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<div>Acesso Exclusivo Home - Lista das 5 opções</div>}
      />
      <Route
        path="/relatorio-visitas"
        element={<div>Relatório de Visitas</div>}
      />
      <Route
        path="/gerenciamento-obra"
        element={<div>Gerenciamento de Obra</div>}
      />
      <Route
        path="/equalizador-servico"
        element={<div>Equalizador de Serviço</div>}
      />
      <Route
        path="/solicitacao-servico"
        element={<div>Solicitação de Serviço</div>}
      />
    </Routes>
  );
}
