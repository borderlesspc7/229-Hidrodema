import { Route, Routes } from "react-router-dom";
import HidroService from "../pages/HidroService/HidroService";
import EspacamentoSuportes from "../pages/HidroService/EspacamentoSuportes/EspacamentoSuportes";
import ConsumoAdesivo from "../pages/HidroService/ConsumoAdesivo/ConsumoAdesivo";

export default function ServiceRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HidroService />} />
      <Route
        path="/resistencia-quimica"
        element={<div>Resistência Química</div>}
      />
      <Route path="/espacamento-suportes" element={<EspacamentoSuportes />} />
      <Route path="/consumo-adesivo" element={<ConsumoAdesivo />} />
      <Route
        path="/peso-termoplasticos"
        element={<div>Peso Termoplásticos</div>}
      />
      <Route path="/curso-senai" element={<div>Curso SENAI</div>} />
    </Routes>
  );
}
