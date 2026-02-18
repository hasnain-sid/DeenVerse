import { SendEmailCommand } from "@aws-sdk/client-ses";
import { ses } from "../config/aws.js";

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "noreply@deenverse.com";
const APP_NAME = "DeenVerse";

/**
 * Check whether AWS SES is actually configured.
 * If not, log a warning and return false so callers can fall back.
 */
function isSesConfigured() {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

/**
 * Low-level send helper.
 */
async function send(to, subject, htmlBody) {
  if (!isSesConfigured()) {
    console.warn("[EmailService] SES not configured — skipping email to", to);
    return false;
  }

  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: htmlBody, Charset: "UTF-8" },
      },
    },
  });

  await ses.send(command);
  return true;
}

// ──────────────────────────────────────────────────────
// Templates
// ──────────────────────────────────────────────────────

function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f4f5;color:#18181b;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    <div style="background:#18181b;padding:24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:-0.5px;">☪ ${APP_NAME}</h1>
    </div>
    <div style="padding:32px 24px;">
      ${content}
    </div>
    <div style="padding:16px 24px;text-align:center;font-size:12px;color:#a1a1aa;border-top:1px solid #e4e4e7;">
      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

function buttonHtml(text, url) {
  return `
    <div style="text-align:center;margin:28px 0;">
      <a href="${url}" style="display:inline-block;padding:12px 32px;background:#18181b;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${text}</a>
    </div>`;
}

// ──────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────

/**
 * Send a password-reset email with a one-time link.
 *
 * @param {string} email – recipient email
 * @param {string} resetUrl – full URL (e.g. https://deenverse.com/reset-password/abc123)
 */
export async function sendPasswordResetEmail(email, resetUrl) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 12px;">Reset your password</h2>
    <p style="margin:0 0 8px;color:#52525b;line-height:1.6;">
      We received a request to reset your password. Click the button below to choose a new one.
      This link expires in <strong>1 hour</strong>.
    </p>
    ${buttonHtml("Reset Password", resetUrl)}
    <p style="margin:0;font-size:13px;color:#a1a1aa;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `);

  return send(email, `${APP_NAME} — Reset Your Password`, html);
}

/**
 * Send an email-verification link after registration.
 *
 * @param {string} email
 * @param {string} verifyUrl – e.g. https://deenverse.com/verify-email/abc123
 */
export async function sendVerificationEmail(email, verifyUrl) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 12px;">Verify your email</h2>
    <p style="margin:0 0 8px;color:#52525b;line-height:1.6;">
      Assalamu Alaikum! Welcome to ${APP_NAME}. Please verify your email address
      to activate your account.
    </p>
    ${buttonHtml("Verify Email", verifyUrl)}
    <p style="margin:0;font-size:13px;color:#a1a1aa;">
      This link expires in 24 hours.
    </p>
  `);

  return send(email, `${APP_NAME} — Verify Your Email`, html);
}

/**
 * Send a daily notification digest.
 *
 * @param {string} email
 * @param {{ type: string, message: string }[]} notifications
 */
export async function sendNotificationDigest(email, notifications) {
  if (!notifications || notifications.length === 0) return false;

  const rows = notifications
    .slice(0, 15) // cap at 15
    .map(
      (n) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f4f4f5;font-size:14px;color:#3f3f46;">${n.message}</td></tr>`
    )
    .join("");

  const html = baseTemplate(`
    <h2 style="margin:0 0 12px;">Your daily digest</h2>
    <p style="margin:0 0 16px;color:#52525b;line-height:1.6;">
      Here's what you missed on ${APP_NAME} today:
    </p>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    ${buttonHtml("Open DeenVerse", process.env.FRONTEND_URL || "http://localhost:3000")}
  `);

  return send(email, `${APP_NAME} — Daily Digest`, html);
}
