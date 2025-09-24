import { Route, Routes } from "react-router-dom";
import HidroService from "../pages/HidroService/HidroService";
import ResistenciaQuimica from "../pages/HidroService/ResistenciaQuimica/ResistenciaQuimica";
import EspacamentoSuportes from "../pages/HidroService/EspacamentoSuportes/EspacamentoSuportes";
import ConsumoAdesivo from "../pages/HidroService/ConsumoAdesivo/ConsumoAdesivo";
import PesoTubos from "../pages/HidroService/PesoTubos/PesoTubos";

export default function ServiceRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HidroService />} />
      <Route path="/resistencia-quimica" element={<ResistenciaQuimica />} />
      <Route path="/espacamento-suportes" element={<EspacamentoSuportes />} />
      <Route path="/consumo-adesivo" element={<ConsumoAdesivo />} />
      <Route path="/peso-termoplasticos" element={<PesoTubos />} />
      <Route path="/curso-senai" element={<div>Curso SENAI</div>} />
    </Routes>
  );
}
