import { Route, Routes } from "react-router-dom";
import { paths } from "./paths";
import Login from "../pages/LoginPage/Login";
import Register from "../pages/RegisterPage/Register";
import Menu from "../pages/MenuPage/Menu";
import ServiceRoutes from "./serviceRoutes";
import ExclusiveRoutes from "./exclusiveRoutes";
import { ProtectedRoute } from "./ProtectedRoute";

function Service() {
  return <div>Service</div>;
}
function Meeting() {
  return <div>Meeting</div>;
}
function Marketing() {
  return <div>Marketing</div>;
}
function Exclusive() {
  return <div>AcessoExclusivo</div>;
}

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={paths.home} element={<Menu />} />
      <Route path={paths.login} element={<Login />} />
      <Route path={paths.register} element={<Register />} />
      <Route path={paths.menu} element={<Menu />} />

      {/* Rotas protegidas para áreas específicas */}
      <Route
        path={paths.service}
        element={
          <ProtectedRoute>
            <Service />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${paths.service}/*`}
        element={
          <ProtectedRoute>
            <ServiceRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.meeting}
        element={
          <ProtectedRoute>
            <Meeting />
          </ProtectedRoute>
        }
      />
      <Route
        path={paths.marketing}
        element={
          <ProtectedRoute>
            <Marketing />
          </ProtectedRoute>
        }
      />

      {/* Rotas aninhadas para acesso exclusivo */}
      <Route
        path={paths.acessoExclusivo}
        element={
          <ProtectedRoute>
            <Exclusive />
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
