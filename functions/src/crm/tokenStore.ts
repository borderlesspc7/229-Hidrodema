import * as admin from "firebase-admin";
import { env } from "./env";

export type StoredToken = {
  accessToken: string;
  expiresAtMs: number;
};

const DOC_PATH = "integrations/crmAuth";

function nowMs() {
  return Date.now();
}

export async function getStoredToken(): Promise<StoredToken | null> {
  const snap = await admin.firestore().doc(DOC_PATH).get();
  if (!snap.exists) return null;
  const data = snap.data() as any;
  const accessToken = typeof data.accessToken === "string" ? data.accessToken : null;
  const expiresAtMs = typeof data.expiresAtMs === "number" ? data.expiresAtMs : null;
  if (!accessToken || !expiresAtMs) return null;
  return { accessToken, expiresAtMs };
}

export async function setStoredToken(token: StoredToken): Promise<void> {
  await admin.firestore().doc(DOC_PATH).set(
    {
      accessToken: token.accessToken,
      expiresAtMs: token.expiresAtMs,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export function tokenIsFresh(token: StoredToken, skewMs = 60_000): boolean {
  return token.expiresAtMs - nowMs() > skewMs;
}

export function getStaticBearerToken(): string | null {
  return env("CRM_BEARER_TOKEN");
}

