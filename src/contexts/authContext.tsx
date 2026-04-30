import { createContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/user";
import type { ReactNode } from "react";
import getFirebaseErrorMessage from "../components/ui/ErrorMessage";
import type { FirebaseError } from "firebase/app";
import type { UserRole } from "../types/user";
import { clearDemoUser, getDemoUser, isDemoEnabled, setDemoUser } from "../lib/demoAuth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginDemo: (role: UserRole) => void;
  sendPasswordRecovery: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const demo = getDemoUser();
    if (demo) {
      setUser(demo);
      setLoading(false);
      return;
    }
    const unsubscribe = authService.observeAuthState((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.login(credentials);
      setUser(user);
      setLoading(false);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      setError(message);
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.register(credentials);
      setUser(user);
      setLoading(false);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      setError(message);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (isDemoEnabled() && user?.uid?.startsWith("demo-")) {
        clearDemoUser();
        setUser(null);
        setLoading(false);
        return;
      }
      await authService.logOut();
      setUser(null);
      setLoading(false);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      setError(message);
      setLoading(false);
    }
  };

  const loginDemo = (role: UserRole) => {
    if (!isDemoEnabled()) return;
    const u = setDemoUser({ role });
    setUser(u);
    setLoading(false);
    setError(null);
  };

  const sendPasswordRecovery = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.sendPasswordRecovery(email);
      setLoading(false);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      setError(message);
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loginDemo,
    sendPasswordRecovery,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
