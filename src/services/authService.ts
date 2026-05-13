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
import {
  doc,
  setDoc,
  getDoc,
  getDocFromCache,
  enableNetwork,
} from "firebase/firestore";
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

async function probeFirestoreReachability(projectId: string): Promise<{
  reachable: boolean;
  status?: number;
  error?: string;
}> {
  // Pinga o endpoint REST do Firestore. Não precisa de auth para responder
  // status — basta a TLS handshake completar. Se falhar com TypeError de rede,
  // o problema é firewall/extensão/proxy local; se vier 401/403, está OK.
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/(default)/documents/__probe__/__probe__`;
  try {
    const res = await fetch(url, { method: "GET", mode: "cors" });
    return { reachable: true, status: res.status };
  } catch (error) {
    return {
      reachable: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function getUserDocFromFirestore(uid: string) {
  const ref = doc(db, "users", uid);

  // 1) Cache primeiro: retorno imediato se o usuário já entrou antes nesta
  //    máquina. Não bloqueia caso o canal Firestore ainda esteja aquecendo.
  try {
    const cached = await getDocFromCache(ref);
    if (cached.exists()) {
      void enableNetwork(db).catch(() => undefined);
      return cached;
    }
  } catch {
    // Sem cache: cai para o servidor.
  }

  // 2) Garante que a rede do SDK esteja ligada (rápido e idempotente).
  try {
    await enableNetwork(db);
  } catch (error) {
    console.warn("Não foi possível religar a rede do Firestore:", error);
  }

  // 3) Apenas uma tentativa: se falhar com "offline", o caller decide o que
  //    fazer (tipicamente, retornar perfil mínimo e tentar de novo em background).
  try {
    return await getDoc(ref);
  } catch (error) {
    if (isFirestoreOfflineError(error)) {
      const diagnostics = {
        ...firebaseDiagnostics,
        browserOnline: navigator.onLine,
        userAgent: navigator.userAgent,
      };
      console.warn("Diagnóstico Firebase/Firestore:", diagnostics);
      console.warn(
        "Diagnóstico Firebase/Firestore JSON:",
        JSON.stringify(diagnostics)
      );
      // Sondagem direta no endpoint REST do Firestore para distinguir
      // entre "SDK estava só aquecendo" (probe responde 401/403/200) e
      // "rede/firewall bloqueando o domínio" (probe rejeita com TypeError).
      void probeFirestoreReachability(
        firebaseDiagnostics.projectId as string
      ).then((probe) => {
        if (!probe.reachable) {
          console.error(
            "[Firestore] Domínio firestore.googleapis.com INACESSÍVEL a partir desta máquina/navegador:",
            probe.error,
            "— verifique firewall corporativo, antivírus, extensão (uBlock/Privacy Badger) ou VPN."
          );
        } else {
          console.warn(
            "[Firestore] Endpoint REST respondeu (status",
            probe.status,
            "), então a rede está OK; o SDK só não conseguiu abrir o canal de listen a tempo. O retry em background deve recuperar."
          );
        }
      });
    }
    throw error;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Reentrega o perfil completo quando o Firestore voltar a responder.
 *
 * Usamos isto após termos entregue um "perfil mínimo" porque o SDK respondeu
 * "client is offline" na 1ª leitura. Em background, tentamos buscar o doc com
 * backoff curto e, se chegar, atualizamos o estado de auth chamando o callback.
 */
function scheduleProfileRecovery(
  uid: string,
  callback: (user: User | null) => void,
  firebaseUser: { email: string | null; displayName: string | null }
): void {
  const delays = [800, 2000, 5000, 10000];
  void (async () => {
    for (const delay of delays) {
      await sleep(delay);
      try {
        const doc = await getUserDocFromFirestore(uid);
        if (doc.exists()) {
          callback(doc.data() as User);
        } else {
          callback(
            asMinimalUser({
              uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            })
          );
        }
        return;
      } catch {
        // Continua tentando — só interessa quando Firestore subir.
      }
    }
  })();
}

function asMinimalUser(firebaseUser: { uid: string; email: string | null; displayName: string | null }): User {
  const now = new Date();
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    name:
      firebaseUser.displayName ??
      (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Usuário"),
    createdAt: now,
    updatedAt: now,
    role: "user",
  };
}

function isFirestoreOfflineError(err: unknown): boolean {
  const e = err as FirebaseError | Error | undefined;
  const code = (e as FirebaseError | undefined)?.code || "";
  const msg = (e as Error | undefined)?.message || "";
  return (
    String(code).includes("unavailable") ||
    String(code).includes("failed-precondition") ||
    msg.toLowerCase().includes("client is offline") ||
    msg.toLowerCase().includes("offline")
  );
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

      let userDoc: Awaited<ReturnType<typeof getUserDocFromFirestore>> | null = null;
      try {
        userDoc = await getUserDocFromFirestore(firebaseUser.uid);
      } catch (e) {
        if (isFirestoreOfflineError(e)) {
          // Rede bloqueando Firestore: deixa o usuário entrar com perfil mínimo.
          return asMinimalUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });
        }
        throw e;
      }

      if (!userDoc.exists()) {
        // Primeiro login de um usuário importado/criado fora do app:
        // cria o doc de perfil para não bloquear o acesso.
        const fallbackUser: User = asMinimalUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? credentials.email,
          displayName: firebaseUser.displayName,
        });
        await setDoc(doc(db, "users", firebaseUser.uid), fallbackUser, {
          merge: true,
        });
        return fallbackUser;
      }

      const userData = userDoc.data() as User;

      const updateUserData = {
        ...userData,
        updatedAt: new Date(),
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

              // Registros legados às vezes vêm com `role: "admin "` (espaço
              // extra), `"Admin"`, etc. Isso quebra checks no client e no
              // backend. Normalizamos uma única vez e gravamos de volta.
              // Importante: aguardamos o setDoc completar antes de devolver
              // o user, senão as primeiras queries (ex.: listagem em
              // RelatorioVisitas) chegam no Firestore com o role ANTIGO no
              // doc — as rules avaliam `users/{uid}.role` e bloqueiam.
              const rawRole = (userData.role ?? "").toString();
              const normalizedRole = rawRole.trim().toLowerCase();
              if (normalizedRole && normalizedRole !== rawRole) {
                userData = { ...userData, role: normalizedRole as User["role"] };
                try {
                  await setDoc(
                    doc(db, "users", firebaseUser.uid),
                    { role: normalizedRole },
                    { merge: true }
                  );
                } catch (e) {
                  console.warn("Falha ao normalizar role no Firestore:", e);
                }
              }

              // Tenta auto-vínculo de vendedor via Cloud Function só pra quem
              // realmente pode ser vendedor — admin/gestor não tem sellerCode
              // por design, então pular evita chamada inútil que ainda por
              // cima gera ruído de CORS quando rodando em localhost.
              const effectiveRole = (userData.role ?? "")
                .toString()
                .trim()
                .toLowerCase();
              const isVendorRole =
                effectiveRole !== "admin" && effectiveRole !== "gestor";
              if (isVendorRole && !userData.sellerCode) {
                try {
                  await claimSellerProfile();
                  const refreshed = await getUserDocFromFirestore(firebaseUser.uid);
                  if (refreshed.exists()) userData = refreshed.data() as User;
                } catch {
                  // not-found / failed-precondition / CORS-em-dev: ignore.
                }
              }

              callback(userData);
            } else {
              // Usuário não encontrado no Firestore: devolve perfil mínimo (não bloqueia UI).
              callback(
                asMinimalUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                })
              );
            }
          } catch (error) {
            if (isFirestoreOfflineError(error)) {
              // Firestore ainda não conectou (SDK aquecendo). Entrega perfil
              // mínimo IMEDIATAMENTE para não travar a UI e agenda recuperação
              // do perfil real em background.
              console.warn(
                "Firestore offline ao carregar perfil; usando perfil mínimo (recovery em background)."
              );
              callback(
                asMinimalUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                })
              );
              scheduleProfileRecovery(firebaseUser.uid, callback, {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
              });
              return;
            }
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
