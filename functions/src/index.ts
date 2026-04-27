import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
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

