import { Route, Routes } from "react-router-dom";
import { paths } from "./paths";
import Login from "../pages/LoginPage/Login";
import Register from "../pages/RegisterPage/Register";
import Menu from "../pages/MenuPage/Menu";
import ServiceRoutes from "./serviceRoutes";
import ExclusiveRoutes from "./exclusiveRoutes";
import { ProtectedRoute } from "./ProtectedRoute";
import HidroService from "../pages/HidroService/HidroService";
import AcessoExclusivo from "../pages/AcessoExclusivo/AcessoExclusivo";
import { features } from "../lib/features";
import { Navigate } from "react-router-dom";

function Meeting() {
  return <div>Meeting</div>;
}
function Marketing() {
  return <div>Marketing</div>;
}

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={paths.home} element={<Menu />} />
      <Route path={paths.login} element={<Login />} />
      <Route path={paths.register} element={<Register />} />
      <Route path={paths.menu} element={<Menu />} />

      {/* Rotas protegidas para áreas específicas */}
      <Route path={paths.service} element={<HidroService />} />
      <Route path={`${paths.service}/*`} element={<ServiceRoutes />} />
      <Route
        path={paths.meeting}
        element={
          <ProtectedRoute>
            {features.meeting ? <Meeting /> : <Navigate to={paths.menu} replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.marketing}
        element={
          <ProtectedRoute>
            {features.marketing ? <Marketing /> : <Navigate to={paths.menu} replace />}
          </ProtectedRoute>
        }
      />

      {/* Rotas aninhadas para acesso exclusivo */}
      <Route
        path={paths.acessoExclusivo}
        element={
          <ProtectedRoute>
            <AcessoExclusivo />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${paths.acessoExclusivo}/*`}
        element={
          <ProtectedRoute>
            <ExclusiveRoutes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
