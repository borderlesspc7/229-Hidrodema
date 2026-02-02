import ErrorBoundary from "./components/ui/ErrorBoundary/ErrorBoundary";
import { AuthProvider } from "./contexts/authContext";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
