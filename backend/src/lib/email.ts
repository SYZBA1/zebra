/**
 * Resend email wrapper — direct API calls, no Lovable gateway.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_BASE = "https://api.resend.com/emails";

export interface SendEmailOptions {
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — email not sent");
    return;
  }

  const response = await fetch(RESEND_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opts.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Resend error ${response.status}: ${errText}`);
    throw new Error(`Email send failed: ${response.status}`);
  }
}

/** Escape HTML special characters to prevent injection in email templates. */
export function escapeHtml(str: string): string {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c)
  );
}
