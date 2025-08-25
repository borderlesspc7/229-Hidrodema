import { Route, Routes } from "react-router-dom";
import { paths } from "./paths";
import Login from "../pages/LoginPage/Login";
import Register from "../pages/RegisterPage/Register";
import Menu from "../pages/MenuPage/Menu";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={paths.home} element={<Menu />} />
      <Route path={paths.login} element={<Login />} />
      <Route path={paths.register} element={<Register />} />
      <Route path={paths.menu} element={<Menu />} />
    </Routes>
  );
};
