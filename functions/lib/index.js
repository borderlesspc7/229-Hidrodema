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
exports.emailVisitReportOnCreate = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
const firebase_functions_1 = require("firebase-functions");
const nodemailer_1 = __importDefault(require("nodemailer"));
const pdfkit_1 = __importDefault(require("pdfkit"));
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
