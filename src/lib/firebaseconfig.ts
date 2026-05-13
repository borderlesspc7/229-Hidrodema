import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  setLogLevel,
  type FirestoreSettings,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const envKeys = [
  ["VITE_FIREBASE_API_KEY", import.meta.env.VITE_FIREBASE_API_KEY],
  ["VITE_FIREBASE_AUTH_DOMAIN", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN],
  ["VITE_FIREBASE_PROJECT_ID", import.meta.env.VITE_FIREBASE_PROJECT_ID],
  ["VITE_FIREBASE_STORAGE_BUCKET", import.meta.env.VITE_FIREBASE_STORAGE_BUCKET],
  ["VITE_FIREBASE_MESSAGING_SENDER_ID", import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID],
  ["VITE_FIREBASE_APP_ID", import.meta.env.VITE_FIREBASE_APP_ID],
] as const;

if (import.meta.env.DEV) {
  const missing = envKeys.filter(([, v]) => !v || String(v).trim() === "");
  if (missing.length > 0) {
    console.error(
      "[Firebase] Variáveis em falta no .env:",
      missing.map(([k]) => k).join(", "),
      "— copie .env.example para .env e preencha com os valores do Firebase Console (Configuração do projeto)."
    );
  } else {
    console.info("[Firebase] Projeto:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} as const;

const configuredFirestoreDatabaseId = String(
  import.meta.env.VITE_FIREBASE_DATABASE_ID || ""
).trim();
// Firestore tem dois "estilos" de banco padrão:
//  - O banco padrão "clássico" tem o ID literal `(default)` (com parênteses).
//  - Bancos *named* (Enterprise/multi-db) recebem nomes próprios, ex.: `default`,
//    `prod`, `staging`. O ID é exatamente o nome — sem parênteses.
// Aqui usamos `(default)` apenas se a env estiver vazia. Qualquer outro valor
// (inclusive a string literal `default`) é tratado como database id literal,
// pois o nome no console NÃO leva parênteses.
const firestoreDatabaseId =
  configuredFirestoreDatabaseId === ""
    ? "(default)"
    : configuredFirestoreDatabaseId;

const app = initializeApp(firebaseConfig);
// `experimentalForceLongPolling: true` forçava polling longo desde o 1º request
// (mais robusto em redes com proxy/firewall, mas com handshake inicial lento que
// fazia o SDK responder "client is offline" antes de conectar).
// `experimentalAutoDetectLongPolling: true` tenta WebSocket primeiro e cai para
// long polling quando detecta bloqueio — startup muito mais rápido em redes ok.
const firestoreSettings: FirestoreSettings = {
  experimentalAutoDetectLongPolling: true,
};

// Em dev, eleva o log do Firestore pra "debug" quando habilitado via querystring
// (ex.: http://localhost:5173/?fsdebug=1). Permite ver no console exatamente
// por que o SDK marca como offline (WebSocket bloqueado, 401, CORS, etc.).
if (import.meta.env.DEV) {
  try {
    const search =
      typeof window !== "undefined" ? window.location.search : "";
    if (search.includes("fsdebug=1")) setLogLevel("debug");
  } catch {
    // ignore
  }
}

export const auth = getAuth(app);
export const db =
  firestoreDatabaseId === "(default)"
    ? initializeFirestore(app, firestoreSettings)
    : initializeFirestore(app, firestoreSettings, firestoreDatabaseId);
export const storage = getStorage(app);
export const functions = getFunctions(app, "southamerica-east1");

export const firebaseDiagnostics = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  firestoreDatabaseId,
  configuredFirestoreDatabaseId: configuredFirestoreDatabaseId || "(empty)",
};

export { app };
export default firebaseConfig;
