import { AuthProvider } from "./contexts/AuthContext";
import { AppRoutes } from "./types/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
