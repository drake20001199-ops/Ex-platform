import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "CoinVault <noreply@coinvault.com.au>";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface SendParams {
  to: string;
  subject: string;
  html: string;
}

async function send({ to, subject, html }: SendParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${BASE_URL}/verify-email?token=${token}`;
  await send({
    to: email,
    subject: "Verify your CoinVault account",
    html: wrap(`
      <h2>Welcome to CoinVault!</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${link}" style="${btnStyle}">Verify Email</a>
      <p style="color:#888;font-size:13px;margin-top:24px;">This link expires in 24 hours.</p>
    `),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  await send({
    to: email,
    subject: "Reset your CoinVault password",
    html: wrap(`
      <h2>Password Reset</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${link}" style="${btnStyle}">Reset Password</a>
      <p style="color:#888;font-size:13px;margin-top:24px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `),
  });
}

export async function sendKycApprovedEmail(email: string, name: string) {
  await send({
    to: email,
    subject: "Identity Verified — You can now trade!",
    html: wrap(`
      <h2>Hi ${escapeHtml(name)},</h2>
      <p>Great news! Your identity verification has been approved. You can now buy Bitcoin and Ethereum on CoinVault.</p>
      <a href="${BASE_URL}/dashboard/buy" style="${btnStyle}">Start Trading</a>
    `),
  });
}

export async function sendKycRejectedEmail(email: string, name: string, reason: string) {
  await send({
    to: email,
    subject: "Verification Update — Action Required",
    html: wrap(`
      <h2>Hi ${escapeHtml(name)},</h2>
      <p>Unfortunately, your identity verification was not approved.</p>
      <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
      <p>Please log in and resubmit your documents.</p>
      <a href="${BASE_URL}/dashboard/kyc" style="${btnStyle}">Resubmit Documents</a>
    `),
  });
}

export async function sendTransactionStatusEmail(
  email: string,
  name: string,
  txId: string,
  status: string,
  details?: { cryptoAmount?: string; txLink?: string }
) {
  const messages: Record<string, string> = {
    AWAITING_PAYMENT: "We've sent you bank transfer details. Please transfer the AUD amount to complete your order.",
    PAYMENT_RECEIVED: "We've received your payment and are processing your order.",
    CRYPTO_SENT: `Your crypto has been sent! ${details?.txLink ? `<a href="${details.txLink}">View on blockchain</a>` : ""}`,
    COMPLETED: "Your transaction is complete. Thank you for using CoinVault!",
    CANCELLED: "Your transaction has been cancelled.",
  };

  await send({
    to: email,
    subject: `Order Update — ${status.replace("_", " ").toLowerCase()}`,
    html: wrap(`
      <h2>Hi ${escapeHtml(name)},</h2>
      <p>${messages[status] || "Your order status has been updated."}</p>
      <a href="${BASE_URL}/dashboard/transactions/${txId}" style="${btnStyle}">View Order</a>
    `),
  });
}

export async function sendAdminNewOrderEmail(
  adminEmail: string,
  customerName: string,
  txId: string,
  cryptoType: string,
  audAmount: number
) {
  await send({
    to: adminEmail,
    subject: `New Order: ${cryptoType} A$${audAmount.toLocaleString()} from ${customerName}`,
    html: wrap(`
      <h2>New Order Received</h2>
      <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p><strong>Crypto:</strong> ${cryptoType}</p>
      <p><strong>Amount:</strong> A$${audAmount.toLocaleString()}</p>
      <a href="${BASE_URL}/admin/transactions/${txId}" style="${btnStyle}">View Order</a>
    `),
  });
}

export async function sendAdminTtrAlertEmail(
  adminEmail: string,
  customerName: string,
  txId: string,
  audAmount: number,
  threshold: number
) {
  await send({
    to: adminEmail,
    subject: `TTR Alert: Transaction A$${audAmount.toLocaleString()} exceeds threshold`,
    html: wrap(`
      <h2 style="color:#f59e0b;">TTR Threshold Alert</h2>
      <p>A transaction of <strong>A$${audAmount.toLocaleString()}</strong> has been created, which meets or exceeds the TTR threshold of A$${threshold.toLocaleString()}.</p>
      <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <a href="${BASE_URL}/admin/transactions/${txId}" style="${btnStyle}">Review Transaction</a>
    `),
  });
}

const btnStyle =
  "display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;";

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c)
  );
}

function wrap(content: string): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0a0e1a;color:#e5e7eb;border-radius:12px;">
      ${content}
      <hr style="border:none;border-top:1px solid #1f2937;margin:32px 0;" />
      <p style="color:#6b7280;font-size:12px;">CoinVault — AUSTRAC Registered Cryptocurrency Exchange</p>
    </div>
  `;
}
