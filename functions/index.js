const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

admin.initializeApp();

/** Gera buffer PDF do relatório de visita (layout institucional simples). */
function buildVisitReportPdf(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const requestId = data.requestId || "";
    const visitDate = data.visitDate || "";
    const formData = data.formData || {};

    doc.fontSize(16).font("Helvetica-Bold").text("Relatório de Visita", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica").text(`Solicitação: ${requestId}  |  Data: ${visitDate}`);
    doc.moveDown(1);

    const entries = Object.entries(formData).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    );
    doc.font("Helvetica-Bold").fontSize(11);
    for (const [key, value] of entries) {
      const valueStr = Array.isArray(value) ? value.join(", ") : String(value ?? "");
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 50;
      }
      doc.font("Helvetica-Bold").text(key, { continued: false });
      doc.font("Helvetica").text(valueStr, { indent: 20 });
      doc.moveDown(0.4);
    }

    doc.end();
  });
}

/**
 * Quando um novo relatório de visita é criado em visitReports,
 * gera o PDF e envia por email para o endereço configurado.
 *
 * Configuração (Firebase Config ou .env):
 * - visitreport.email_to: email de destino
 * - smtp.user / smtp.pass (e opcionalmente host, port, from): SMTP
 */
exports.onVisitReportCreated = functions
  .region("southamerica-east1")
  .firestore.document("visitReports/{reportId}")
  .onCreate(async (snap, context) => {
    const reportId = context.params.reportId;
    const data = snap.data();

    const emailTo =
      process.env.VISIT_REPORT_EMAIL_TO ||
      functions.config().visitreport?.email_to;
    if (!emailTo) {
      console.log(
        "VISIT_REPORT_EMAIL_TO não configurado. Configure: firebase functions:config:set visitreport.email_to=destino@empresa.com"
      );
      return null;
    }

    const requestId = data.requestId || "";
    const visitDate = data.visitDate || "";
    const textBody = [
      "RELATÓRIO DE VISITA",
      `Solicitação: ${requestId} | Data: ${visitDate}`,
      "",
      "Consulte o PDF em anexo.",
    ].join("\n");

    let pdfBuffer;
    try {
      pdfBuffer = await buildVisitReportPdf(data);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      throw err;
    }

    let transporter;
    try {
      const smtpUser = process.env.SMTP_USER || functions.config().smtp?.user;
      const smtpPass = process.env.SMTP_PASS || functions.config().smtp?.pass;
      if (smtpUser && smtpPass) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || functions.config().smtp?.host || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
        });
      }
    } catch (err) {
      console.error("Erro ao criar transporter SMTP:", err);
      return null;
    }

    if (!transporter) {
      console.log("SMTP não configurado. PDF gerado (tamanho " + pdfBuffer.length + " bytes).");
      return null;
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || functions.config().smtp?.from || "noreply@hidrodema.com",
        to: emailTo,
        subject: `Relatório de Visita - ${requestId} - ${visitDate}`,
        text: textBody,
        attachments: [
          {
            filename: `relatorio-visita-${requestId}-${visitDate.replace(/\//g, "-")}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
      console.log(`Email com PDF enviado para ${emailTo} (relatório ${reportId})`);
    } catch (err) {
      console.error("Erro ao enviar email:", err);
      throw err;
    }

    return null;
  });
