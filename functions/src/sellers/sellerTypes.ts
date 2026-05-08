export type CrmSellerRecord = Record<string, unknown>;

export type SellerDirectoryDoc = {
  externalId: string;
  code?: string;
  name?: string;
  email?: string;
  active?: boolean;
  teamId?: string;
  regionId?: string;
  raw?: Record<string, unknown>;
  updatedAt: string;
};

