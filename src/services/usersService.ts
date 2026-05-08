import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
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
  patch: Partial<
    Pick<
      User,
      | "role"
      | "sellerCode"
      | "sellerExternalId"
      | "name"
      | "specialties"
      | "specialtyNote"
    >
  >
): Promise<void> {
  const safe: Record<string, any> = {};
  if (patch.role) safe.role = patch.role satisfies UserRole;
  if (patch.sellerCode !== undefined) safe.sellerCode = patch.sellerCode;
  if (patch.sellerExternalId !== undefined) safe.sellerExternalId = patch.sellerExternalId;
  if (patch.name !== undefined) safe.name = patch.name;
  if (patch.specialties !== undefined) safe.specialties = patch.specialties;
  if (patch.specialtyNote !== undefined) safe.specialtyNote = patch.specialtyNote;
  safe.updatedAt = new Date();

  await updateDoc(doc(db, "users", uid), safe);
}

