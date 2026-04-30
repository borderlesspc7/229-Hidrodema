import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebaseconfig";

export type ClaimSellerProfileResult = {
  ok: boolean;
  sellerExternalId?: string;
  sellerCode?: string;
  updatedAt?: unknown;
};

export type PerformanceKpisResult = {
  scopeKey: string;
  updatedAt: string;
  windowDays: number;
  visitRequests: number;
  visitReports: number;
  serviceRequests: number;
  serviceMds: number;
};

export async function claimSellerProfile(): Promise<ClaimSellerProfileResult> {
  const fn = httpsCallable<void, ClaimSellerProfileResult>(
    functions,
    "claimSellerProfile"
  );
  const res = await fn();
  return res.data;
}

export async function getPerformanceKpis(): Promise<PerformanceKpisResult> {
  const fn = httpsCallable<void, PerformanceKpisResult>(
    functions,
    "getPerformanceKpis"
  );
  const res = await fn();
  return res.data;
}

export type SyncSellerDirectoryResult = {
  ok: boolean;
  fetched: number;
  processed: number;
  updatedAt: string;
};

export async function syncSellerDirectory(): Promise<SyncSellerDirectoryResult> {
  const fn = httpsCallable<void, SyncSellerDirectoryResult>(
    functions,
    "syncSellerDirectory"
  );
  const res = await fn();
  return res.data;
}

export type AdminLinkUserToSellerInput = {
  userEmail: string;
  sellerExternalId: string;
};

export type AdminLinkUserToSellerResult = {
  ok: boolean;
  targetUid: string;
  sellerExternalId?: string;
  sellerCode?: string;
  teamId?: string;
  regionId?: string;
  updatedAt?: unknown;
};

export async function adminLinkUserToSeller(
  input: AdminLinkUserToSellerInput
): Promise<AdminLinkUserToSellerResult> {
  const fn = httpsCallable<AdminLinkUserToSellerInput, AdminLinkUserToSellerResult>(
    functions,
    "adminLinkUserToSeller"
  );
  const res = await fn(input);
  return res.data;
}

export type AdminUnlinkUserSellerInput = { userEmail: string };
export type AdminUnlinkUserSellerResult = { ok: boolean; targetUid: string };

export async function adminUnlinkUserSeller(
  input: AdminUnlinkUserSellerInput
): Promise<AdminUnlinkUserSellerResult> {
  const fn = httpsCallable<AdminUnlinkUserSellerInput, AdminUnlinkUserSellerResult>(
    functions,
    "adminUnlinkUserSeller"
  );
  const res = await fn(input);
  return res.data;
}

