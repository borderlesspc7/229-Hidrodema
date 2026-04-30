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

