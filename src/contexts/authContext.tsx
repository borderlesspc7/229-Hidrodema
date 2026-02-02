import { createContext, useEffect, useRef, useState } from "react";
import { authService } from "../services/authService";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/user";
import type { ReactNode } from "react";
import getFirebaseErrorMessage from "../components/ui/ErrorMessage";
import type { FirebaseError } from "firebase/app";

const SESSION_EXPIRED_MESSAGE =
  "Sessão expirada. Faça login novamente para continuar.";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  sessionExpiredMessage: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearSessionExpiredMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<
    string | null
  >(null);

  const hadUserRef = useRef(false);
  const logoutInProgressRef = useRef(false);

  useEffect(() => {
    const unsubscribe = authService.observeAuthState((nextUser) => {
      if (nextUser) {
        hadUserRef.current = true;
        setUser(nextUser);
        setSessionExpiredMessage(null);
      } else {
        if (hadUserRef.current && !logoutInProgressRef.current) {
          setSessionExpiredMessage(SESSION_EXPIRED_MESSAGE);
        }
        hadUserRef.current = false;
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      setSessionExpiredMessage(null);
      const user = await authService.login(credentials);
      hadUserRef.current = true;
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
      setSessionExpiredMessage(null);
      const user = await authService.register(credentials);
      hadUserRef.current = true;
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
      logoutInProgressRef.current = true;
      setLoading(true);
      await authService.logOut();
      setUser(null);
      setSessionExpiredMessage(null);
      setLoading(false);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      setError(message);
      setLoading(false);
    } finally {
      logoutInProgressRef.current = false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearSessionExpiredMessage = () => {
    setSessionExpiredMessage(null);
  };

  const value = {
    user,
    loading,
    error,
    sessionExpiredMessage,
    login,
    register,
    logout,
    clearError,
    clearSessionExpiredMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
