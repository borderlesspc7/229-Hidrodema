import { auth, db, firebaseDiagnostics } from "../lib/firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
  onAuthStateChanged,
  getIdTokenResult,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDocFromServer, enableNetwork } from "firebase/firestore";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/user";
import getFirebaseErrorMessage from "../components/ui/ErrorMessage";
import { claimSellerProfile } from "./cloudFunctionsService";
import { getDemoUser, isDemoEnabled } from "../lib/demoAuth";

interface FirebaseError {
  code?: string;
  message?: string;
  customData?: {
    serverResponse?: string;
  };
}

export const SESSION_EXPIRED_MESSAGE =
  "Sua sessão expirou. Faça login novamente para continuar.";

async function getUserDocFromFirestore(uid: string) {
  try {
    await enableNetwork(db);
  } catch (error) {
    console.warn("Não foi possível religar a rede do Firestore:", error);
  }

  try {
    return await getDocFromServer(doc(db, "users", uid));
  } catch (error) {
    console.error("Diagnóstico Firebase/Firestore:", {
      ...firebaseDiagnostics,
      browserOnline: navigator.onLine,
      userAgent: navigator.userAgent,
    });
    throw error;
  }
}

export const authService = {
  async logOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      throw new Error(message);
    }
  },

  async validateSession(): Promise<{ valid: boolean; reason?: "expired" | "invalid" }> {
    if (isDemoEnabled() && getDemoUser()) return { valid: true };
    const current = auth.currentUser;
    if (!current) return { valid: false, reason: "invalid" };

    try {
      const token = await getIdTokenResult(current);
      const expMs = new Date(token.expirationTime).getTime();
      if (!Number.isFinite(expMs)) return { valid: false, reason: "invalid" };
      if (Date.now() >= expMs) return { valid: false, reason: "expired" };
      return { valid: true };
    } catch {
      return { valid: false, reason: "invalid" };
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      const userDoc = await getUserDocFromFirestore(firebaseUser.uid);

      if (!userDoc.exists()) {
        throw new Error("USER_DOC_MISSING");
      }

      const userData = userDoc.data() as User;

      const updateUserData = {
        ...userData,
        lastLogin: new Date(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), updateUserData);

      return updateUserData;
    } catch (error) {
      console.error("Erro detalhado no login:", error);
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      throw new Error(message);
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      // Validação dos campos obrigatórios
      if (!credentials.email || !credentials.password || !credentials.name) {
        throw new Error("Todos os campos são obrigatórios");
      }

      if (credentials.password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      const userData: User = {
        uid: firebaseUser.uid,
        email: credentials.email,
        name: credentials.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: credentials.role || "user", // Role padrão se não especificado
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      return userData;
    } catch (error) {
      console.error("Erro detalhado no registro:", error);
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      throw new Error(message);
    }
  },

  async sendPasswordRecovery(email: string): Promise<void> {
    try {
      const e = email?.trim();
      if (!e) throw new Error("Informe um email válido.");
      await sendPasswordResetEmail(auth, e);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      throw new Error(message);
    }
  },

  observeAuthState(callback: (user: User | null) => void): Unsubscribe {
    try {
      if (isDemoEnabled()) {
        const demo = getDemoUser();
        if (demo) {
          callback(demo);
          return () => {};
        }
      }
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Usuário está logado, busca dados completos no Firestore
          try {
            const userDoc = await getUserDocFromFirestore(firebaseUser.uid);
            if (userDoc.exists()) {
              let userData = userDoc.data() as User;

              // Se o usuário ainda não tiver sellerCode, tenta auto-vínculo via Cloud Function.
              // Isso escreve `sellerCode/sellerExternalId` em `users/{uid}`.
              if (!userData.sellerCode) {
                try {
                  await claimSellerProfile();
                  const refreshed = await getUserDocFromFirestore(firebaseUser.uid);
                  if (refreshed.exists()) userData = refreshed.data() as User;
                } catch {
                  // not-found / failed-precondition: ignore (sem vendedor para o email, ou conta sem email)
                }
              }

              callback(userData);
            } else {
              callback(null); // Usuário não encontrado no Firestore
            }
          } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            callback(null);
          }
        } else {
          // Usuário não está logado
          callback(null);
        }
      });
    } catch (error) {
      throw new Error("Erro ao observar estado de autenticação: " + error);
    }
  },
};
