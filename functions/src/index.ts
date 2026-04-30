import * as admin from "firebase-admin";
import {
  onDocumentCreated,
  onDocumentWritten,
} from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

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
    const snap = await admin.firestore().collection("users").doc(params.createdBy).get();
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

export const emailVisitReportOnCreate = onDocumentCreated(
  {
    document: "visitReports/{id}",
    region: "southamerica-east1",
  },
  async (event: any) => {
    const data = event.data?.data() as VisitReportDoc | undefined;
    if (!data) return;

    const transport = createTransport();
    if (!transport) {
      logger.warn("SMTP env not configured; skipping email send.");
      return;
    }

    const to = await resolveRecipientEmail({ createdBy: data.createdBy });
    if (!to) {
      logger.warn("No recipient email found; skipping.");
      return;
    }

    const pdf = await buildPdfBuffer({
      title: "Relatório de Visita",
      report: data,
    });

    const from = env("SMTP_FROM") || env("SMTP_USER")!;
    await transport.sendMail({
      from,
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

    logger.info("Visit report email sent.", { to, requestId: data.requestId });
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

/**
 * Sincroniza custom claims a partir do documento `users/{uid}`.
 * Isso habilita enforcement nas Firestore Rules (role/sellerCode/team/region).
 */
export const syncClaimsFromUserDoc = onDocumentWritten(
  { document: "users/{uid}", region: "southamerica-east1" },
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
  { document: "users/{uid}", region: "southamerica-east1" },
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
      await admin.firestore().collection("permissionAudit").add({
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

    const cacheRef = admin.firestore().collection("kpiCache").doc(scopeKey);
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

    const db = admin.firestore();
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

    const qs = await admin
      .firestore()
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

    await admin.firestore().collection("users").doc(req.auth.uid).set(patch, {
      merge: true,
    });

    return { ok: true, ...patch };
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
  await admin.firestore().collection("auditLogs").add(entry);
}

/**
 * Auditoria (write/update/delete) em coleções de negócio.
 * Observação: leitura (read) não é auditável nativamente no Firestore; para isso seria necessário
 * passar por Cloud Functions/Backend para consultas sensíveis.
 */
export const auditBusinessWrites = onDocumentWritten(
  {
    document: "{col}/{id}",
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

