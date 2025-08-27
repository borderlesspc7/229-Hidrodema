import { Route, Routes } from "react-router-dom";
import HidroService from "../pages/HidroService/HidroService";

export default function ServiceRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HidroService />} />
      <Route
        path="/resistencia-quimica"
        element={<div>Resistência Química</div>}
      />
      <Route
        path="/espacamento-suportes"
        element={<div>Espaçamento de Suportes</div>}
      />
      <Route path="/consumo-adesivo" element={<div>Consumo de Adesivo</div>} />
      <Route
        path="/peso-termoplasticos"
        element={<div>Peso Termoplásticos</div>}
      />
      <Route path="/curso-senai" element={<div>Curso SENAI</div>} />
    </Routes>
  );
}
