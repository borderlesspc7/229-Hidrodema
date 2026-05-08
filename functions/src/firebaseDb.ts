import { getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const rawDatabaseId = String(process.env.FIRESTORE_DATABASE_ID || "").trim();

// Firestore default database id é "(default)". Alguns setups usam "default" por engano.
export const FIRESTORE_DATABASE_ID =
  rawDatabaseId === "" || rawDatabaseId === "default" || rawDatabaseId === "(default)"
    ? "(default)"
    : rawDatabaseId;

export function getDb() {
  const app = getApp();
  return FIRESTORE_DATABASE_ID === "(default)"
    ? getFirestore(app)
    : getFirestore(app, FIRESTORE_DATABASE_ID);
}
