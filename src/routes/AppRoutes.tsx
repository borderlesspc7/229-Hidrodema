import { lazy, Suspense } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { paths } from "./paths";
import Login from "../pages/LoginPage/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { features } from "../lib/features";
import PageLoading from "../components/PageLoading";

// Páginas leves (frequentes mas que não precisam estar no chunk inicial)
const Register = lazy(() => import("../pages/RegisterPage/Register"));
const Menu = lazy(() => import("../pages/MenuPage/Menu"));

// Rotas pesadas: HidroService (calculadoras, dados grandes) e AcessoExclusivo (admin)
const HidroService = lazy(() => import("../pages/HidroService/HidroService"));
const ServiceRoutes = lazy(() => import("./serviceRoutes"));
const AcessoExclusivo = lazy(() => import("../pages/AcessoExclusivo/AcessoExclusivo"));
const ExclusiveRoutes = lazy(() => import("./exclusiveRoutes"));

function Meeting() {
  return <div>Meeting</div>;
}
function Marketing() {
  return <div>Marketing</div>;
}

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path={paths.home} element={<Navigate to={paths.login} replace />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        <Route path={paths.menu} element={<Menu />} />

        {/* Rotas protegidas para áreas específicas */}
        <Route path={paths.service} element={<HidroService />} />
        <Route path={`${paths.service}/*`} element={<ServiceRoutes />} />
        <Route
          path={paths.meeting}
          element={
            features.meeting ? (
              <ProtectedRoute>
                <Meeting />
              </ProtectedRoute>
            ) : (
              <Navigate to={paths.menu} replace />
            )
          }
        />
        <Route
          path={paths.marketing}
          element={
            features.marketing ? (
              <ProtectedRoute>
                <Marketing />
              </ProtectedRoute>
            ) : (
              <Navigate to={paths.menu} replace />
            )
          }
        />

        {/* Uma árvore aninhada: mesmo `ProtectedRoute`, `index` = menu, `*` = subrotas (RR7 não compete duas rotas irmãs no mesmo prefixo). */}
        <Route
          path={paths.acessoExclusivo}
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<PageLoading />}>
                <AcessoExclusivo />
              </Suspense>
            }
          />
          <Route path="*" element={<ExclusiveRoutes />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
