import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import PageLoading from "../components/PageLoading";

const HidroService = lazy(() => import("../pages/HidroService/HidroService"));
const ResistenciaQuimica = lazy(() => import("../pages/HidroService/ResistenciaQuimica/ResistenciaQuimica"));
const EspacamentoSuportes = lazy(() => import("../pages/HidroService/EspacamentoSuportes/EspacamentoSuportes"));
const ConsumoAdesivo = lazy(() => import("../pages/HidroService/ConsumoAdesivo/ConsumoAdesivo"));
const PesoTubos = lazy(() => import("../pages/HidroService/PesoTubos/PesoTubos"));
const CursoSenai = lazy(() => import("../pages/HidroService/CursoSenai/CursoSenai"));

export default function ServiceRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<HidroService />} />
        <Route path="/resistencia-quimica" element={<ResistenciaQuimica />} />
        <Route path="/espacamento-suportes" element={<EspacamentoSuportes />} />
        <Route path="/consumo-adesivo" element={<ConsumoAdesivo />} />
        <Route path="/peso-termoplasticos" element={<PesoTubos />} />
        <Route path="/curso-senai" element={<CursoSenai />} />
      </Routes>
    </Suspense>
  );
}
