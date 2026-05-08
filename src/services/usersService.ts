import { collection, doc, getDocs, updateDoc, type UpdateData } from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { User, UserRole } from "../types/user";

export async function listUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs
    .map((d) => d.data() as User)
    .filter((u) => Boolean(u?.uid) && Boolean(u?.email));
}

export async function updateUserAdminFields(
  uid: string,
  patch: Partial<Pick<User, "role" | "sellerCode" | "sellerExternalId" | "name">>
): Promise<void> {
  const safe: UpdateData<User> = {};
  if (patch.role) safe.role = patch.role satisfies UserRole;
  if (patch.sellerCode !== undefined) safe.sellerCode = patch.sellerCode;
  if (patch.sellerExternalId !== undefined) safe.sellerExternalId = patch.sellerExternalId;
  if (patch.name !== undefined) safe.name = patch.name;
  safe.updatedAt = new Date();

  await updateDoc(doc(db, "users", uid), safe);
}

