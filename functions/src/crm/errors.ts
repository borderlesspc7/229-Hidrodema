export class CrmError extends Error {
  name = "CrmError";
  status?: number;
  retriable?: boolean;

  constructor(message: string, opts?: { status?: number; retriable?: boolean }) {
    super(message);
    this.status = opts?.status;
    this.retriable = opts?.retriable;
  }
}

