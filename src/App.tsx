import { AuthProvider } from "./contexts/authContext";
import { AppRoutes } from "./routes/AppRoutes";
import ScrollToBottomFab from "./components/ScrollToBottomFab";

function App() {
  return (
    <AuthProvider>
      <div className="hd-page-bg">
        <div className="hd-layer">
          <AppRoutes />
          <ScrollToBottomFab />
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
