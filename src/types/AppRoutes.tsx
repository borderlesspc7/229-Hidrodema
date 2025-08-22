import { Route, Routes } from "react-router-dom";
import { paths } from "../routes/paths";

const Home = () => {
  return <div>Home</div>;
};

const Login = () => {
  return <div>Login</div>;
};

const Register = () => {
  return <div>Register</div>;
};
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={paths.home} element={<Home />} />
      <Route path={paths.login} element={<Login />} />
      <Route path={paths.register} element={<Register />} />
    </Routes>
  );
};
