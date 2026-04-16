import { AuthProvider } from "./contexts/authContext";
import { AppRoutes } from "./routes/AppRoutes";
import ScrollToBottomFab from "./components/ScrollToBottomFab";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ScrollToBottomFab />
    </AuthProvider>
  );
}

export default App;
