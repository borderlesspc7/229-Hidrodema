import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, type FirestoreSettings } from "firebase/firestore";
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
const firestoreDatabaseId =
  configuredFirestoreDatabaseId === "" ||
  configuredFirestoreDatabaseId === "default" ||
  configuredFirestoreDatabaseId === "(default)"
    ? "(default)"
    : configuredFirestoreDatabaseId;

const app = initializeApp(firebaseConfig);
const firestoreSettings: FirestoreSettings = {
  experimentalAutoDetectLongPolling: true,
};

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
