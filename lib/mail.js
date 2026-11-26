import nodemailer from "nodemailer";
import { COMPANY } from "./company.js";

let transporter;
const getTransporter = () => {
  transporter ||= nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
  });
  return transporter;
};

export const INBOX = process.env.LEADS_TO || COMPANY.email;

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const oneLine = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").trim();

export async function sendInternal({ subject, title, rows, body, replyTo, to = INBOX }) {
  const table = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7076;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  const text = [
    title,
    "",
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    "",
    body || ""
  ].join("\n");

  await getTransporter().sendMail({
    from: `"FileFlow Website" <${process.env.GMAIL_USER}>`,
    to,
    replyTo: replyTo || undefined,
    subject: oneLine(subject).slice(0, 180),
    text,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#15171a;max-width:640px">
      <h2 style="font-size:18px;margin:0 0 12px">${escapeHtml(title)}</h2>
      <table style="border-collapse:collapse;margin-bottom:16px">${table}</table>
      ${body ? `<div style="border-top:1px solid #d6d9dd;padding-top:12px">${escapeHtml(body).replace(/\n/g, "<br>")}</div>` : ""}
    </div>`
  });
}

export async function sendAutoReply({ to, name }) {
  if (process.env.AUTO_REPLY === "off") return;
  const first = oneLine(name).split(" ")[0] || "there";
  await getTransporter().sendMail({
    from: `"FileFlow" <${process.env.GMAIL_USER}>`,
    to,
    replyTo: COMPANY.email,
    subject: "We got your message",
    text: `Hi ${first},

Thanks for reaching out to FileFlow. We've received your message and our team will reply ${COMPANY.responseTime}.

If it's urgent, call or text us at ${COMPANY.phone}.

The FileFlow team
${COMPANY.site}`
  });
}
