import * as admin from "firebase-admin";
import {
  onDocumentCreated,
  onDocumentWritten,
} from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import crypto from "crypto";
import {
  syncSellerDirectoryFromCrm,
  syncSingleSellerFromCrm,
} from "./sellers/sellerDirectorySync";
import { safeFirestoreDocId } from "./sellers/sellerMapper";
import { syncSellerDirectoryFromExternalApi } from "./sellers/externalSellerSync";
import { FIRESTORE_DATABASE_ID, getDb } from "./firebaseDb";

admin.initializeApp();

type VisitReportDoc = {
  requestId: string;
  createdBy?: string;
  visitDate?: string;
  mainTheme?: string;
  reportText?: string;
  nextAction?: string;
  followUpDate?: string;
};

type ServiceRequestDoc = {
  requestId?: string;
  status?: string;
  requesterEmail?: string;
  requesterName?: string;
  technicalNote?: string;
  updatedAt?: unknown;
};

function env(name: string): string | null {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
}

function buildPdfBuffer(params: {
  title: string;
  report: VisitReportDoc;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks: Buffer[] = [];
      doc.on("data", (d: any) => chunks.push(d as Buffer));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc
        .fontSize(18)
        .text("HIDRODEMA", { align: "left" })
        .moveDown(0.2);
      doc.fontSize(13).text(params.title).moveDown(1);

      const kv = (k: string, v: string) => {
        doc.fontSize(10).fillColor("#0f172a").text(k, { continued: true });
        doc.fontSize(10).fillColor("#334155").text(` ${v}`);
      };

      kv("ID solicitação:", params.report.requestId || "-");
      kv("Data:", params.report.visitDate || "-");
      kv("Tema:", params.report.mainTheme || "-");
      doc.moveDown(0.8);

      doc
        .fontSize(11)
        .fillColor("#0f172a")
        .text("Relatório", { underline: true });
      doc
        .moveDown(0.4)
        .fontSize(10)
        .fillColor("#334155")
        .text(params.report.reportText || "-", { align: "left" });

      doc.moveDown(0.8);
      kv("Próxima ação:", params.report.nextAction || "-");
      kv("Follow-up:", params.report.followUpDate || "-");

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

async function resolveRecipientEmail(params: { createdBy?: string }): Promise<string | null> {
  if (!params.createdBy) return null;
  try {
    const snap = await getDb().collection("users").doc(params.createdBy).get();
    const email = (snap.data()?.email as string | undefined) ?? null;
    return email && email.includes("@") ? email : null;
  } catch {
    return null;
  }
}

function createTransport() {
  const host = env("SMTP_HOST");
  const port = env("SMTP_PORT");
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
}

async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
}) {
  const transport = createTransport();
  if (!transport) return { ok: false as const, reason: "smtp-not-configured" as const };
  const from = env("SMTP_FROM") || env("SMTP_USER")!;
  await transport.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    attachments: params.attachments,
  });
  return { ok: true as const };
}

export const emailVisitReportOnCreate = onDocumentCreated(
  {
    document: "visitReports/{id}",
    database: FIRESTORE_DATABASE_ID,
    region: "southamerica-east1",
  },
  async (event: any) => {
    const data = event.data?.data() as VisitReportDoc | undefined;
    if (!data) return;

    const to = await resolveRecipientEmail({ createdBy: data.createdBy });
    if (!to) {
      logger.warn("No recipient email found; skipping.");
      return;
    }

    const pdf = await buildPdfBuffer({
      title: "Relatório de Visita",
      report: data,
    });

    const sent = await sendEmail({
      to,
      subject: `Relatório de Visita — ${data.requestId}`,
      text: "Segue em anexo o PDF do relatório de visita.",
      attachments: [
        {
          filename: `relatorio-visita-${data.requestId}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });
    if (!sent.ok) {
      logger.warn("SMTP env not configured; skipping email send.");
      return;
    }

    logger.info("Visit report email sent.", { to, requestId: data.requestId });
  }
);

function asCsvCell(v: unknown): string {
  const s = String(v ?? "");
  // CSV com aspas e escape de aspas duplas
  const escaped = s.replaceAll('"', '""');
  return `"${escaped}"`;
}

function buildServiceRequestCsvRow(docId: string, data: ServiceRequestDoc): string {
  const cols = [
    docId,
    data.requestId ?? "",
    data.status ?? "",
    data.requesterName ?? "",
    data.requesterEmail ?? "",
    data.technicalNote ?? "",
    typeof data.updatedAt === "string" ? data.updatedAt : "",
  ];
  return cols.map(asCsvCell).join(",");
}

export const exportServiceRequestsCsv = onCall(
  { region: "southamerica-east1" },
  async (req: any) => {
    requireMacro(req);

    const status = typeof req.data?.status === "string" ? req.data.status : null;
    const limitRaw = typeof req.data?.limit === "number" ? req.data.limit : 500;
    const limit = Math.max(1, Math.min(2000, Math.floor(limitRaw)));

    const db = getDb();
    let q: FirebaseFirestore.Query = db.collection("serviceRequests");
    if (status) q = q.where("status", "==", status);
    q = q.orderBy("updatedAt", "desc").limit(limit);

    const snap = await q.get();
    const header = [
      "docId",
      "requestId",
      "status",
      "requesterName",
      "requesterEmail",
      "technicalNote",
      "updatedAt",
    ].map(asCsvCell).join(",");

    const rows = snap.docs.map((d) =>
      buildServiceRequestCsvRow(d.id, d.data() as ServiceRequestDoc)
    );
    const csv = [header, ...rows].join("\n");

    const bucket = admin.storage().bucket();
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const path = `exports/serviceRequests-${stamp}.csv`;
    const file = bucket.file(path);
    await file.save(Buffer.from(csv, "utf8"), {
      contentType: "text/csv; charset=utf-8",
      resumable: false,
    });

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000,
    });

    return { ok: true, count: snap.size, storagePath: path, downloadUrl: url };
  }
);

export const emailServiceRequestOnCompleted = onDocumentWritten(
  {
    document: "serviceRequests/{id}",
    database: FIRESTORE_DATABASE_ID,
    region: "southamerica-east1",
  },
  async (event: any) => {
    const before = event.data?.before?.data?.() as ServiceRequestDoc | undefined;
    const after = event.data?.after?.data?.() as ServiceRequestDoc | undefined;
    if (!after) return;

    const prevStatus = typeof before?.status === "string" ? before.status : null;
    const nextStatus = typeof after.status === "string" ? after.status : null;
    if (prevStatus === nextStatus) return;
    if (nextStatus !== "completed") return;

    const to = typeof after.requesterEmail === "string" ? after.requesterEmail : null;
    if (!to || !to.includes("@")) return;

    const proto = after.requestId ?? event.params?.id ?? "solicitação";
    const note = (after.technicalNote ?? "").toString().trim();

    const text =
      `Sua solicitação ${proto} foi concluída.\n\n` +
      (note ? `Observação técnica:\n${note}\n\n` : "") +
      "Obrigado.\n";

    try {
      const sent = await sendEmail({
        to,
        subject: `Hidrodema — Solicitação concluída (${proto})`,
        text,
      });
      if (!sent.ok) {
        logger.warn("SMTP env not configured; skipping completion email.");
        return;
      }
      logger.info("Service request completion email sent.", { to, requestId: proto });
    } catch (e) {
      logger.error("Failed to send completion email.", { to, error: String(e) });
    }
  }
);

type UserDoc = {
  uid: string;
  role?: string;
  sellerCode?: string;
  sellerExternalId?: string;
  regionId?: string;
  teamId?: string;
  email?: string;
  name?: string;
};

function safeStr(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s ? s : undefined;
}

function normalizeRole(role: unknown): "admin" | "gestor" | "vendedor" | "user" {
  const r = safeStr(role)?.toLowerCase();
  if (r === "admin" || r === "gestor" || r === "vendedor") return r;
  return "user";
}

function requireMacro(req: any) {
  if (!req.auth?.uid) throw new HttpsError("unauthenticated", "Login required");
  const role = normalizeRole(req.auth.token.role);
  if (role !== "admin" && role !== "gestor") {
    throw new HttpsError("permission-denied", "Acesso restrito à gestão.");
  }
  return { uid: req.auth.uid as string, role };
}

/**
 * Sincroniza custom claims a partir do documento `users/{uid}`.
 * Isso habilita enforcement nas Firestore Rules (role/sellerCode/team/region).
 */
export const syncClaimsFromUserDoc = onDocumentWritten(
  { document: "users/{uid}", database: FIRESTORE_DATABASE_ID, region: "southamerica-east1" },
  async (event: any) => {
    const uid = event.params?.uid as string | undefined;
    const after = event.data?.after?.data?.() as UserDoc | undefined;
    if (!uid || !after) return;

    const claims = {
      role: normalizeRole(after.role),
      sellerCode: safeStr(after.sellerCode),
      sellerExternalId: safeStr(after.sellerExternalId),
      regionId: safeStr(after.regionId),
      teamId: safeStr(after.teamId),
      viewAll: normalizeRole(after.role) === "admin" || normalizeRole(after.role) === "gestor",
    };

    try {
      await admin.auth().setCustomUserClaims(uid, claims);
      logger.info("Custom claims synced.", { uid, claims });
    } catch (e) {
      logger.error("Failed to set custom claims.", { uid, error: String(e) });
    }
  }
);

/**
 * Trilhas de auditoria específicas para mudanças de permissão (role/seller/team/region).
 */
export const auditPermissionChanges = onDocumentWritten(
  { document: "users/{uid}", database: FIRESTORE_DATABASE_ID, region: "southamerica-east1" },
  async (event: any) => {
    const uid = event.params?.uid as string | undefined;
    if (!uid) return;

    const before = event.data?.before?.data?.() as UserDoc | undefined;
    const after = event.data?.after?.data?.() as UserDoc | undefined;
    if (!after) return;

    const watched: (keyof UserDoc)[] = [
      "role",
      "sellerCode",
      "sellerExternalId",
      "teamId",
      "regionId",
    ];

    const changes: Record<string, { from?: string; to?: string }> = {};
    for (const k of watched) {
      const b = safeStr((before as any)?.[k]);
      const a = safeStr((after as any)?.[k]);
      if (b !== a) changes[k] = { from: b, to: a };
    }

    if (Object.keys(changes).length === 0) return;

    try {
      await getDb().collection("permissionAudit").add({
        at: new Date().toISOString(),
        uid,
        email: safeStr(after.email),
        name: safeStr(after.name),
        changes,
      });
    } catch (e) {
      logger.error("Failed to write permission audit.", { uid, error: String(e) });
    }
  }
);

type KpiResult = {
  scopeKey: string;
  updatedAt: string;
  windowDays: number;
  visitRequests: number;
  visitReports: number;
  serviceRequests: number;
  serviceMds: number;
};

function daysAgoIso(days: number): string {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

/**
 * Dashboard de performance (básico) com cache.
 * - Macro (admin/gestor): agrega tudo.
 * - Vendedor: agrega por sellerCode/uid.
 * Cache: `kpiCache/{scopeKey}` por 5 minutos.
 */
export const getPerformanceKpis = onCall(
  { region: "southamerica-east1" },
  async (req: any) => {
    if (!req.auth?.uid) throw new HttpsError("unauthenticated", "Login required");

    const role = normalizeRole(req.auth.token.role);
    const sellerCode = safeStr(req.auth.token.sellerCode);
    const uid = req.auth.uid as string;

    const windowDays = 30;
    const since = daysAgoIso(windowDays);

    const scopeKey =
      role === "admin" || role === "gestor"
        ? "all"
        : sellerCode
          ? `seller:${sellerCode}`
          : `user:${uid}`;

    const cacheRef = getDb().collection("kpiCache").doc(scopeKey);
    const cached = await cacheRef.get();
    const now = Date.now();
    if (cached.exists) {
      const data = cached.data() as any;
      const updatedAt = safeStr(data.updatedAt);
      const updatedMs = updatedAt ? new Date(updatedAt).getTime() : 0;
      if (updatedMs && now - updatedMs < 5 * 60 * 1000) {
        return data as KpiResult;
      }
    }

    const db = getDb();
    const applyScope = (col: string) => {
      const base = db.collection(col).where("createdAt", ">=", since);
      if (scopeKey === "all") return base;
      if (sellerCode) {
        return base.where("ownerSellerCode", "==", sellerCode);
      }
      return base.where("createdBy", "==", uid);
    };

    const [visitRequests, visitReports, serviceRequests, serviceMds] =
      await Promise.all([
        applyScope("visitRequests").count().get(),
        applyScope("visitReports").count().get(),
        applyScope("serviceRequests").count().get(),
        applyScope("serviceMDS").count().get(),
      ]);

    const result: KpiResult = {
      scopeKey,
      updatedAt: new Date().toISOString(),
      windowDays,
      visitRequests: visitRequests.data().count,
      visitReports: visitReports.data().count,
      serviceRequests: serviceRequests.data().count,
      serviceMds: serviceMds.data().count,
    };

    await cacheRef.set(result, { merge: true });
    return result;
  }
);

/**
 * Auto-vínculo seller ↔ user (self-service) baseado no email.
 * Procura em `sellerDirectory` um registro com `email` igual ao email autenticado.
 * Se encontrar, escreve `sellerExternalId`/`sellerCode` no `users/{uid}`.
 */
export const claimSellerProfile = onCall(
  { region: "southamerica-east1" },
  async (req: any) => {
    if (!req.auth?.uid) throw new HttpsError("unauthenticated", "Login required");
    const email = safeStr(req.auth.token.email);
    if (!email) throw new HttpsError("failed-precondition", "Missing email");

    const qs = await getDb()
      .collection("sellerDirectory")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (qs.empty) {
      throw new HttpsError(
        "not-found",
        "Nenhum vendedor encontrado para este email."
      );
    }

    const doc = qs.docs[0]!;
    const data = doc.data() as any;
    const patch = {
      sellerExternalId: safeStr(data.externalId) ?? doc.id,
      sellerCode: safeStr(data.code),
      updatedAt: new Date(),
    };

    await getDb().collection("users").doc(req.auth.uid).set(patch, {
      merge: true,
    });

    return { ok: true, ...patch };
  }
);

function corpEmailAllowed(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain) return false;
  const single = env("CORP_EMAIL_DOMAIN")?.toLowerCase();
  const list = (env("CORP_EMAIL_DOMAINS") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const allowed = [...(single ? [single] : []), ...list];
  if (allowed.length === 0) return true; // se não configurar, não bloqueia
  return allowed.some((d) => domain === d || domain.endsWith(`.${d}`));
}

async function findUserByEmail(email: string): Promise<{ id: string; data: UserDoc } | null> {
  const qs = await getDb().collection("users").where("email", "==", email).limit(1).get();
  if (qs.empty) return null;
  const doc = qs.docs[0]!;
  return { id: doc.id, data: doc.data() as UserDoc };
}

type AdminLinkPayload = {
  userEmail: string;
  sellerExternalId: string;
};

async function writeSellerLinkHistory(entry: {
  at: string;
  actorUid: string;
  targetUid: string;
  userEmail?: string;
  action: "link" | "unlink";
  sellerExternalId?: string;
  sellerCode?: string;
}) {
  await getDb().collection("sellerUserLinkHistory").add(entry);
}

/**
 * Vínculo técnico (admin/gestor): associa um user (por email) a um vendedor do diretório.
 * - Valida domínio corporativo (opcional via env)
 * - Escreve histórico em `sellerUserLinkHistory`
 */
export const adminLinkUserToSeller = onCall(
  { region: "southamerica-east1" },
  async (req: any) => {
    const { uid: actorUid } = requireMacro(req);
    const payload = req.data as Partial<AdminLinkPayload>;
    const userEmail = safeStr(payload?.userEmail)?.toLowerCase();
    const sellerExternalId = safeStr(payload?.sellerExternalId);
    if (!userEmail || !sellerExternalId) {
      throw new HttpsError("invalid-argument", "userEmail e sellerExternalId são obrigatórios.");
    }
    if (!corpEmailAllowed(userEmail)) {
      throw new HttpsError("failed-precondition", "Email não pertence ao domínio corporativo.");
    }

    const user = await findUserByEmail(userEmail);
    if (!user) throw new HttpsError("not-found", "Usuário não encontrado para este email.");

    const sellerSnap = await getDb()
      .collection("sellerDirectory")
      .doc(safeFirestoreDocId(sellerExternalId))
      .get();
    if (!sellerSnap.exists) throw new HttpsError("not-found", "Vendedor não encontrado no sellerDirectory.");
    const seller = sellerSnap.data() as any;

    const patch = {
      sellerExternalId: safeStr(seller.externalId) ?? sellerExternalId,
      sellerCode: safeStr(seller.code),
      teamId: safeStr(seller.teamId),
      regionId: safeStr(seller.regionId),
      updatedAt: new Date(),
    };

    await getDb().collection("users").doc(user.id).set(patch, { merge: true });
    await writeSellerLinkHistory({
      at: new Date().toISOString(),
      actorUid,
      targetUid: user.id,
      userEmail,
      action: "link",
      sellerExternalId: patch.sellerExternalId,
      sellerCode: patch.sellerCode,
    });

    return { ok: true, targetUid: user.id, ...patch };
  }
);

export const adminUnlinkUserSeller = onCall(
  { region: "southamerica-east1" },
  async (req: any) => {
    const { uid: actorUid } = requireMacro(req);
    const email = safeStr(req.data?.userEmail)?.toLowerCase();
    if (!email) throw new HttpsError("invalid-argument", "userEmail é obrigatório.");

    const user = await findUserByEmail(email);
    if (!user) throw new HttpsError("not-found", "Usuário não encontrado para este email.");

    const beforeSellerExternalId = safeStr(user.data.sellerExternalId);
    const beforeSellerCode = safeStr(user.data.sellerCode);

    await getDb().collection("users").doc(user.id).set(
      {
        sellerExternalId: admin.firestore.FieldValue.delete(),
        sellerCode: admin.firestore.FieldValue.delete(),
        teamId: admin.firestore.FieldValue.delete(),
        regionId: admin.firestore.FieldValue.delete(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    await writeSellerLinkHistory({
      at: new Date().toISOString(),
      actorUid,
      targetUid: user.id,
      userEmail: email,
      action: "unlink",
      sellerExternalId: beforeSellerExternalId,
      sellerCode: beforeSellerCode,
    });

    return { ok: true, targetUid: user.id };
  }
);

type AuditEntry = {
  at: string;
  collection: string;
  docId: string;
  action: "create" | "update" | "delete";
  actorUid?: string;
  ownerUid?: string;
  ownerSellerCode?: string;
};

async function writeAudit(entry: AuditEntry) {
  await getDb().collection("auditLogs").add(entry);
}

/**
 * Auditoria (write/update/delete) em coleções de negócio.
 * Observação: leitura (read) não é auditável nativamente no Firestore; para isso seria necessário
 * passar por Cloud Functions/Backend para consultas sensíveis.
 */
export const auditBusinessWrites = onDocumentWritten(
  {
    document: "{col}/{id}",
    database: FIRESTORE_DATABASE_ID,
    region: "southamerica-east1",
  },
  async (event: any) => {
    const col = event.params?.col as string | undefined;
    const id = event.params?.id as string | undefined;
    if (!col || !id) return;

    const watched = new Set([
      "visitRequests",
      "visitReports",
      "serviceRequests",
      "serviceMDS",
      "obrasProjects",
    ]);
    if (!watched.has(col)) return;

    const beforeExists = Boolean(event.data?.before?.exists);
    const afterExists = Boolean(event.data?.after?.exists);
    const action: AuditEntry["action"] = !beforeExists && afterExists
      ? "create"
      : beforeExists && afterExists
        ? "update"
        : "delete";

    const after = afterExists ? (event.data.after.data() as any) : undefined;
    const ownerUid = safeStr(after?.ownerUid) ?? safeStr(after?.createdBy);
    const ownerSellerCode = safeStr(after?.ownerSellerCode);

    try {
      await writeAudit({
        at: new Date().toISOString(),
        collection: col,
        docId: id,
        action,
        actorUid: safeStr(after?.updatedBy) ?? safeStr(after?.createdBy),
        ownerUid,
        ownerSellerCode,
      });
    } catch (e) {
      logger.error("Failed to write audit entry.", { col, id, error: String(e) });
    }
  }
);

/**
 * Sincroniza o diretório de vendedores (`sellerDirectory`) a partir do CRM.
 * Restrito a admin/gestor.
 */
export const syncSellerDirectory = onCall(
  { region: "southamerica-east1" },
  async (req: any) => {
    requireMacro(req);
    try {
      return await syncSellerDirectoryFromCrm();
    } catch (e) {
      logger.error("Seller sync failed.", { error: String(e) });
      throw new HttpsError("internal", "Falha ao sincronizar vendedores.");
    }
  }
);

/**
 * Sincroniza o diretório de vendedores (`sellerDirectory`) a partir de uma API externa (HTTP).
 * Restrito a admin/gestor.
 *
 * Configuração (Functions env):
 * - SELLER_API_BASE_URL=https://api.exemplo.com/v1
 * - SELLER_API_TOKEN=... (opcional, Bearer)
 */
export const syncSellerDirectoryExternal = onCall(
  { region: "southamerica-east1" },
  async (req: any) => {
    requireMacro(req);
    try {
      return await syncSellerDirectoryFromExternalApi();
    } catch (e) {
      logger.error("External seller sync failed.", { error: String(e) });
      throw new HttpsError("internal", "Falha ao sincronizar vendedores (API externa).");
    }
  }
);

function timingSafeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function readWebhookSignature(req: any): string | null {
  const h =
    (req.get?.("x-crm-signature") as string | undefined) ??
    (req.get?.("x-hub-signature-256") as string | undefined) ??
    (req.headers?.["x-crm-signature"] as string | undefined) ??
    (req.headers?.["x-hub-signature-256"] as string | undefined);
  return typeof h === "string" && h.trim() ? h.trim() : null;
}

function computeWebhookSignature(secret: string, rawBody: Buffer): string {
  // formato comum: "sha256=<hex>"
  const hex = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return `sha256=${hex}`;
}

/**
 * Webhook do CRM para atualizações imediatas (Seller).
 * - Valida assinatura HMAC sha256 no header (x-crm-signature ou x-hub-signature-256)
 * - Se vier `sellerId`, atualiza apenas esse vendedor; caso contrário, enfileira sync completo.
 */
export const crmSellerWebhook = onRequest(
  { region: "southamerica-east1" },
  async (req: any, res: any) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const secret = env("CRM_WEBHOOK_SECRET");
    if (!secret) {
      res.status(500).send("Webhook secret not configured");
      return;
    }

    const rawBody: Buffer =
      (req.rawBody as Buffer | undefined) ??
      Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {}));

    const received = readWebhookSignature(req);
    const expected = computeWebhookSignature(secret, rawBody);
    if (!received || !timingSafeEqual(received, expected)) {
      res.status(401).send("Invalid signature");
      return;
    }

    const payload = req.body as any;
    const sellerId =
      typeof payload?.sellerId === "string"
        ? payload.sellerId
        : typeof payload?.id === "string"
          ? payload.id
          : typeof payload?.data?.sellerId === "string"
            ? payload.data.sellerId
            : typeof payload?.data?.id === "string"
              ? payload.data.id
              : null;

    try {
      if (sellerId) {
        const result = await syncSingleSellerFromCrm({ sellerId });
        res.status(200).json({ ok: true, mode: "single", result });
        return;
      }

      await enqueueIntegrationJob({ type: "syncSellers", priority: "high" });
      res.status(202).json({ ok: true, mode: "enqueued" });
    } catch (e) {
      logger.error("Webhook processing failed.", { error: String(e) });
      res.status(500).json({ ok: false });
    }
  }
);

type IntegrationJob = {
  type: "syncSellers";
  priority?: "high" | "normal";
  createdAt: string;
  requestedBy?: string;
  status?: "queued" | "running" | "ok" | "error";
  startedAt?: string;
  finishedAt?: string;
  result?: any;
  error?: string;
};

async function enqueueIntegrationJob(job: Omit<IntegrationJob, "createdAt" | "status">) {
  await getDb().collection("integrationJobs").add({
    ...job,
    createdAt: new Date().toISOString(),
    status: "queued",
  } satisfies IntegrationJob);
}

async function notifyAdmin(subject: string, text: string) {
  const to = env("ALERT_EMAIL");
  const transport = createTransport();
  if (!to || !transport) return;
  const from = env("SMTP_FROM") || env("SMTP_USER")!;
  await transport.sendMail({ from, to, subject, text });
}

/**
 * Cron (madrugada) para manter `sellerDirectory` sincronizado automaticamente.
 */
export const nightlySellerSyncEnqueue = onSchedule(
  {
    region: "southamerica-east1",
    timeZone: "America/Sao_Paulo",
    schedule: "0 3 * * *",
  },
  async () => {
    await enqueueIntegrationJob({ type: "syncSellers", priority: "normal" });
    logger.info("Nightly seller sync job enqueued.");
  }
);

/**
 * Worker da fila de integrações (assíncrono).
 * Processa `integrationJobs/{jobId}` criados via cron ou admin/webhook.
 */
export const processIntegrationJobs = onDocumentCreated(
  {
    document: "integrationJobs/{jobId}",
    database: FIRESTORE_DATABASE_ID,
    region: "southamerica-east1",
  },
  async (event: any) => {
    const jobId = event.params?.jobId as string | undefined;
    const data = event.data?.data?.() as IntegrationJob | undefined;
    if (!jobId || !data) return;

    if (data.type !== "syncSellers") return;

    const ref = getDb().collection("integrationJobs").doc(jobId);
    await ref.set({ status: "running", startedAt: new Date().toISOString() }, { merge: true });

    try {
      const result = await syncSellerDirectoryFromCrm();
      await ref.set(
        {
          status: "ok",
          finishedAt: new Date().toISOString(),
          result,
        },
        { merge: true }
      );
      logger.info("Integration job completed.", { jobId, type: data.type, result });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await ref.set(
        {
          status: "error",
          finishedAt: new Date().toISOString(),
          error: msg,
        },
        { merge: true }
      );
      logger.error("Integration job failed.", { jobId, type: data.type, error: msg });
      await notifyAdmin("Hidrodema: falha no job de integração", `Job ${jobId} (${data.type}) falhou:\n\n${msg}`);
    }
  }
);
