"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processIntegrationJobs = exports.nightlySellerSyncEnqueue = exports.crmSellerWebhook = exports.syncSellerDirectory = exports.auditBusinessWrites = exports.adminUnlinkUserSeller = exports.adminLinkUserToSeller = exports.claimSellerProfile = exports.getPerformanceKpis = exports.auditPermissionChanges = exports.syncClaimsFromUserDoc = exports.emailVisitReportOnCreate = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const nodemailer_1 = __importDefault(require("nodemailer"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const crypto_1 = __importDefault(require("crypto"));
const sellerDirectorySync_1 = require("./sellers/sellerDirectorySync");
const sellerMapper_1 = require("./sellers/sellerMapper");
admin.initializeApp();
function env(name) {
    const v = process.env[name];
    return v && v.trim() ? v.trim() : null;
}
function buildPdfBuffer(params) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({ size: "A4", margin: 40 });
            const chunks = [];
            doc.on("data", (d) => chunks.push(d));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc
                .fontSize(18)
                .text("HIDRODEMA", { align: "left" })
                .moveDown(0.2);
            doc.fontSize(13).text(params.title).moveDown(1);
            const kv = (k, v) => {
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
        }
        catch (e) {
            reject(e);
        }
    });
}
async function resolveRecipientEmail(params) {
    if (!params.createdBy)
        return null;
    try {
        const snap = await admin.firestore().collection("users").doc(params.createdBy).get();
        const email = snap.data()?.email ?? null;
        return email && email.includes("@") ? email : null;
    }
    catch {
        return null;
    }
}
function createTransport() {
    const host = env("SMTP_HOST");
    const port = env("SMTP_PORT");
    const user = env("SMTP_USER");
    const pass = env("SMTP_PASS");
    if (!host || !port || !user || !pass)
        return null;
    return nodemailer_1.default.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass },
    });
}
exports.emailVisitReportOnCreate = (0, firestore_1.onDocumentCreated)({
    document: "visitReports/{id}",
    region: "southamerica-east1",
}, async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
    const transport = createTransport();
    if (!transport) {
        firebase_functions_1.logger.warn("SMTP env not configured; skipping email send.");
        return;
    }
    const to = await resolveRecipientEmail({ createdBy: data.createdBy });
    if (!to) {
        firebase_functions_1.logger.warn("No recipient email found; skipping.");
        return;
    }
    const pdf = await buildPdfBuffer({
        title: "Relatório de Visita",
        report: data,
    });
    const from = env("SMTP_FROM") || env("SMTP_USER");
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
    firebase_functions_1.logger.info("Visit report email sent.", { to, requestId: data.requestId });
});
function safeStr(v) {
    if (typeof v !== "string")
        return undefined;
    const s = v.trim();
    return s ? s : undefined;
}
function normalizeRole(role) {
    const r = safeStr(role)?.toLowerCase();
    if (r === "admin" || r === "gestor" || r === "vendedor")
        return r;
    return "user";
}
function requireMacro(req) {
    if (!req.auth?.uid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    const role = normalizeRole(req.auth.token.role);
    if (role !== "admin" && role !== "gestor") {
        throw new https_1.HttpsError("permission-denied", "Acesso restrito à gestão.");
    }
    return { uid: req.auth.uid, role };
}
/**
 * Sincroniza custom claims a partir do documento `users/{uid}`.
 * Isso habilita enforcement nas Firestore Rules (role/sellerCode/team/region).
 */
exports.syncClaimsFromUserDoc = (0, firestore_1.onDocumentWritten)({ document: "users/{uid}", region: "southamerica-east1" }, async (event) => {
    const uid = event.params?.uid;
    const after = event.data?.after?.data?.();
    if (!uid || !after)
        return;
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
        firebase_functions_1.logger.info("Custom claims synced.", { uid, claims });
    }
    catch (e) {
        firebase_functions_1.logger.error("Failed to set custom claims.", { uid, error: String(e) });
    }
});
/**
 * Trilhas de auditoria específicas para mudanças de permissão (role/seller/team/region).
 */
exports.auditPermissionChanges = (0, firestore_1.onDocumentWritten)({ document: "users/{uid}", region: "southamerica-east1" }, async (event) => {
    const uid = event.params?.uid;
    if (!uid)
        return;
    const before = event.data?.before?.data?.();
    const after = event.data?.after?.data?.();
    if (!after)
        return;
    const watched = [
        "role",
        "sellerCode",
        "sellerExternalId",
        "teamId",
        "regionId",
    ];
    const changes = {};
    for (const k of watched) {
        const b = safeStr(before?.[k]);
        const a = safeStr(after?.[k]);
        if (b !== a)
            changes[k] = { from: b, to: a };
    }
    if (Object.keys(changes).length === 0)
        return;
    try {
        await admin.firestore().collection("permissionAudit").add({
            at: new Date().toISOString(),
            uid,
            email: safeStr(after.email),
            name: safeStr(after.name),
            changes,
        });
    }
    catch (e) {
        firebase_functions_1.logger.error("Failed to write permission audit.", { uid, error: String(e) });
    }
});
function daysAgoIso(days) {
    const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return d.toISOString();
}
/**
 * Dashboard de performance (básico) com cache.
 * - Macro (admin/gestor): agrega tudo.
 * - Vendedor: agrega por sellerCode/uid.
 * Cache: `kpiCache/{scopeKey}` por 5 minutos.
 */
exports.getPerformanceKpis = (0, https_1.onCall)({ region: "southamerica-east1" }, async (req) => {
    if (!req.auth?.uid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    const role = normalizeRole(req.auth.token.role);
    const sellerCode = safeStr(req.auth.token.sellerCode);
    const uid = req.auth.uid;
    const windowDays = 30;
    const since = daysAgoIso(windowDays);
    const scopeKey = role === "admin" || role === "gestor"
        ? "all"
        : sellerCode
            ? `seller:${sellerCode}`
            : `user:${uid}`;
    const cacheRef = admin.firestore().collection("kpiCache").doc(scopeKey);
    const cached = await cacheRef.get();
    const now = Date.now();
    if (cached.exists) {
        const data = cached.data();
        const updatedAt = safeStr(data.updatedAt);
        const updatedMs = updatedAt ? new Date(updatedAt).getTime() : 0;
        if (updatedMs && now - updatedMs < 5 * 60 * 1000) {
            return data;
        }
    }
    const db = admin.firestore();
    const applyScope = (col) => {
        const base = db.collection(col).where("createdAt", ">=", since);
        if (scopeKey === "all")
            return base;
        if (sellerCode) {
            return base.where("ownerSellerCode", "==", sellerCode);
        }
        return base.where("createdBy", "==", uid);
    };
    const [visitRequests, visitReports, serviceRequests, serviceMds] = await Promise.all([
        applyScope("visitRequests").count().get(),
        applyScope("visitReports").count().get(),
        applyScope("serviceRequests").count().get(),
        applyScope("serviceMDS").count().get(),
    ]);
    const result = {
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
});
/**
 * Auto-vínculo seller ↔ user (self-service) baseado no email.
 * Procura em `sellerDirectory` um registro com `email` igual ao email autenticado.
 * Se encontrar, escreve `sellerExternalId`/`sellerCode` no `users/{uid}`.
 */
exports.claimSellerProfile = (0, https_1.onCall)({ region: "southamerica-east1" }, async (req) => {
    if (!req.auth?.uid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    const email = safeStr(req.auth.token.email);
    if (!email)
        throw new https_1.HttpsError("failed-precondition", "Missing email");
    const qs = await admin
        .firestore()
        .collection("sellerDirectory")
        .where("email", "==", email)
        .limit(1)
        .get();
    if (qs.empty) {
        throw new https_1.HttpsError("not-found", "Nenhum vendedor encontrado para este email.");
    }
    const doc = qs.docs[0];
    const data = doc.data();
    const patch = {
        sellerExternalId: safeStr(data.externalId) ?? doc.id,
        sellerCode: safeStr(data.code),
        updatedAt: new Date(),
    };
    await admin.firestore().collection("users").doc(req.auth.uid).set(patch, {
        merge: true,
    });
    return { ok: true, ...patch };
});
function corpEmailAllowed(email) {
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    if (!domain)
        return false;
    const single = env("CORP_EMAIL_DOMAIN")?.toLowerCase();
    const list = (env("CORP_EMAIL_DOMAINS") ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    const allowed = [...(single ? [single] : []), ...list];
    if (allowed.length === 0)
        return true; // se não configurar, não bloqueia
    return allowed.some((d) => domain === d || domain.endsWith(`.${d}`));
}
async function findUserByEmail(email) {
    const qs = await admin.firestore().collection("users").where("email", "==", email).limit(1).get();
    if (qs.empty)
        return null;
    const doc = qs.docs[0];
    return { id: doc.id, data: doc.data() };
}
async function writeSellerLinkHistory(entry) {
    await admin.firestore().collection("sellerUserLinkHistory").add(entry);
}
/**
 * Vínculo técnico (admin/gestor): associa um user (por email) a um vendedor do diretório.
 * - Valida domínio corporativo (opcional via env)
 * - Escreve histórico em `sellerUserLinkHistory`
 */
exports.adminLinkUserToSeller = (0, https_1.onCall)({ region: "southamerica-east1" }, async (req) => {
    const { uid: actorUid } = requireMacro(req);
    const payload = req.data;
    const userEmail = safeStr(payload?.userEmail)?.toLowerCase();
    const sellerExternalId = safeStr(payload?.sellerExternalId);
    if (!userEmail || !sellerExternalId) {
        throw new https_1.HttpsError("invalid-argument", "userEmail e sellerExternalId são obrigatórios.");
    }
    if (!corpEmailAllowed(userEmail)) {
        throw new https_1.HttpsError("failed-precondition", "Email não pertence ao domínio corporativo.");
    }
    const user = await findUserByEmail(userEmail);
    if (!user)
        throw new https_1.HttpsError("not-found", "Usuário não encontrado para este email.");
    const sellerSnap = await admin
        .firestore()
        .collection("sellerDirectory")
        .doc((0, sellerMapper_1.safeFirestoreDocId)(sellerExternalId))
        .get();
    if (!sellerSnap.exists)
        throw new https_1.HttpsError("not-found", "Vendedor não encontrado no sellerDirectory.");
    const seller = sellerSnap.data();
    const patch = {
        sellerExternalId: safeStr(seller.externalId) ?? sellerExternalId,
        sellerCode: safeStr(seller.code),
        teamId: safeStr(seller.teamId),
        regionId: safeStr(seller.regionId),
        updatedAt: new Date(),
    };
    await admin.firestore().collection("users").doc(user.id).set(patch, { merge: true });
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
});
exports.adminUnlinkUserSeller = (0, https_1.onCall)({ region: "southamerica-east1" }, async (req) => {
    const { uid: actorUid } = requireMacro(req);
    const email = safeStr(req.data?.userEmail)?.toLowerCase();
    if (!email)
        throw new https_1.HttpsError("invalid-argument", "userEmail é obrigatório.");
    const user = await findUserByEmail(email);
    if (!user)
        throw new https_1.HttpsError("not-found", "Usuário não encontrado para este email.");
    const beforeSellerExternalId = safeStr(user.data.sellerExternalId);
    const beforeSellerCode = safeStr(user.data.sellerCode);
    await admin.firestore().collection("users").doc(user.id).set({
        sellerExternalId: admin.firestore.FieldValue.delete(),
        sellerCode: admin.firestore.FieldValue.delete(),
        teamId: admin.firestore.FieldValue.delete(),
        regionId: admin.firestore.FieldValue.delete(),
        updatedAt: new Date(),
    }, { merge: true });
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
});
async function writeAudit(entry) {
    await admin.firestore().collection("auditLogs").add(entry);
}
/**
 * Auditoria (write/update/delete) em coleções de negócio.
 * Observação: leitura (read) não é auditável nativamente no Firestore; para isso seria necessário
 * passar por Cloud Functions/Backend para consultas sensíveis.
 */
exports.auditBusinessWrites = (0, firestore_1.onDocumentWritten)({
    document: "{col}/{id}",
    region: "southamerica-east1",
}, async (event) => {
    const col = event.params?.col;
    const id = event.params?.id;
    if (!col || !id)
        return;
    const watched = new Set([
        "visitRequests",
        "visitReports",
        "serviceRequests",
        "serviceMDS",
        "obrasProjects",
    ]);
    if (!watched.has(col))
        return;
    const beforeExists = Boolean(event.data?.before?.exists);
    const afterExists = Boolean(event.data?.after?.exists);
    const action = !beforeExists && afterExists
        ? "create"
        : beforeExists && afterExists
            ? "update"
            : "delete";
    const after = afterExists ? event.data.after.data() : undefined;
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
    }
    catch (e) {
        firebase_functions_1.logger.error("Failed to write audit entry.", { col, id, error: String(e) });
    }
});
/**
 * Sincroniza o diretório de vendedores (`sellerDirectory`) a partir do CRM.
 * Restrito a admin/gestor.
 */
exports.syncSellerDirectory = (0, https_1.onCall)({ region: "southamerica-east1" }, async (req) => {
    requireMacro(req);
    try {
        return await (0, sellerDirectorySync_1.syncSellerDirectoryFromCrm)();
    }
    catch (e) {
        firebase_functions_1.logger.error("Seller sync failed.", { error: String(e) });
        throw new https_1.HttpsError("internal", "Falha ao sincronizar vendedores.");
    }
});
function timingSafeEqual(a, b) {
    try {
        const ba = Buffer.from(a);
        const bb = Buffer.from(b);
        if (ba.length !== bb.length)
            return false;
        return crypto_1.default.timingSafeEqual(ba, bb);
    }
    catch {
        return false;
    }
}
function readWebhookSignature(req) {
    const h = req.get?.("x-crm-signature") ??
        req.get?.("x-hub-signature-256") ??
        req.headers?.["x-crm-signature"] ??
        req.headers?.["x-hub-signature-256"];
    return typeof h === "string" && h.trim() ? h.trim() : null;
}
function computeWebhookSignature(secret, rawBody) {
    // formato comum: "sha256=<hex>"
    const hex = crypto_1.default.createHmac("sha256", secret).update(rawBody).digest("hex");
    return `sha256=${hex}`;
}
/**
 * Webhook do CRM para atualizações imediatas (Seller).
 * - Valida assinatura HMAC sha256 no header (x-crm-signature ou x-hub-signature-256)
 * - Se vier `sellerId`, atualiza apenas esse vendedor; caso contrário, enfileira sync completo.
 */
exports.crmSellerWebhook = (0, https_1.onRequest)({ region: "southamerica-east1" }, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
    }
    const secret = env("CRM_WEBHOOK_SECRET");
    if (!secret) {
        res.status(500).send("Webhook secret not configured");
        return;
    }
    const rawBody = req.rawBody ??
        Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {}));
    const received = readWebhookSignature(req);
    const expected = computeWebhookSignature(secret, rawBody);
    if (!received || !timingSafeEqual(received, expected)) {
        res.status(401).send("Invalid signature");
        return;
    }
    const payload = req.body;
    const sellerId = typeof payload?.sellerId === "string"
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
            const result = await (0, sellerDirectorySync_1.syncSingleSellerFromCrm)({ sellerId });
            res.status(200).json({ ok: true, mode: "single", result });
            return;
        }
        await enqueueIntegrationJob({ type: "syncSellers", priority: "high" });
        res.status(202).json({ ok: true, mode: "enqueued" });
    }
    catch (e) {
        firebase_functions_1.logger.error("Webhook processing failed.", { error: String(e) });
        res.status(500).json({ ok: false });
    }
});
async function enqueueIntegrationJob(job) {
    await admin.firestore().collection("integrationJobs").add({
        ...job,
        createdAt: new Date().toISOString(),
        status: "queued",
    });
}
async function notifyAdmin(subject, text) {
    const to = env("ALERT_EMAIL");
    const transport = createTransport();
    if (!to || !transport)
        return;
    const from = env("SMTP_FROM") || env("SMTP_USER");
    await transport.sendMail({ from, to, subject, text });
}
/**
 * Cron (madrugada) para manter `sellerDirectory` sincronizado automaticamente.
 */
exports.nightlySellerSyncEnqueue = (0, scheduler_1.onSchedule)({
    region: "southamerica-east1",
    timeZone: "America/Sao_Paulo",
    schedule: "0 3 * * *",
}, async () => {
    await enqueueIntegrationJob({ type: "syncSellers", priority: "normal" });
    firebase_functions_1.logger.info("Nightly seller sync job enqueued.");
});
/**
 * Worker da fila de integrações (assíncrono).
 * Processa `integrationJobs/{jobId}` criados via cron ou admin/webhook.
 */
exports.processIntegrationJobs = (0, firestore_1.onDocumentCreated)({ document: "integrationJobs/{jobId}", region: "southamerica-east1" }, async (event) => {
    const jobId = event.params?.jobId;
    const data = event.data?.data?.();
    if (!jobId || !data)
        return;
    if (data.type !== "syncSellers")
        return;
    const ref = admin.firestore().collection("integrationJobs").doc(jobId);
    await ref.set({ status: "running", startedAt: new Date().toISOString() }, { merge: true });
    try {
        const result = await (0, sellerDirectorySync_1.syncSellerDirectoryFromCrm)();
        await ref.set({
            status: "ok",
            finishedAt: new Date().toISOString(),
            result,
        }, { merge: true });
        firebase_functions_1.logger.info("Integration job completed.", { jobId, type: data.type, result });
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await ref.set({
            status: "error",
            finishedAt: new Date().toISOString(),
            error: msg,
        }, { merge: true });
        firebase_functions_1.logger.error("Integration job failed.", { jobId, type: data.type, error: msg });
        await notifyAdmin("Hidrodema: falha no job de integração", `Job ${jobId} (${data.type}) falhou:\n\n${msg}`);
    }
});
