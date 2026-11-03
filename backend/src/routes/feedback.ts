import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, escapeHtml } from "../lib/email";

const router = Router();

router.post("/feedback", async (req: Request, res: Response): Promise<void> => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const name    = String(req.body.name    ?? "").slice(0, 100).trim();
    const email   = String(req.body.email   ?? "").slice(0, 255).trim();
    const rating  = Number(req.body.rating);
    const comment = String(req.body.comment ?? "").slice(0, 1000).trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
      return;
    }

    // Persist to visitor_feedback table
    const { error: dbErr } = await supabase.from("visitor_feedback").insert({
      name:    name    || null,
      email:   email   || null,
      rating,
      comment: comment || null,
    });
    if (dbErr) console.error("DB insert error:", dbErr);

    // Send email notification via Resend (direct — no Lovable gateway)
    const recipient = process.env.FEEDBACK_RECIPIENT_EMAIL;
    if (recipient) {
      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff;color:#111;">
          <h2 style="color:#FF7A1A;margin:0 0 16px;">New Zebra Visitor Feedback</h2>
          <p style="font-size:24px;margin:0 0 12px;color:#FF7A1A;">${stars} <span style="color:#666;font-size:14px;">(${rating}/5)</span></p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr><td style="padding:6px 0;color:#666;width:120px;">Name</td><td style="padding:6px 0;"><strong>${escapeHtml(name) || "Anonymous"}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;">${escapeHtml(email) || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Comment</td><td style="padding:6px 0;white-space:pre-wrap;">${escapeHtml(comment) || "—"}</td></tr>
          </table>
          <p style="font-size:12px;color:#888;margin-top:24px;">Sent from Zebra Business Path</p>
        </div>`;

      try {
        await sendEmail({
          from: "Zebra Feedback <onboarding@resend.dev>",
          to: [recipient],
          subject: `New visitor feedback — ${rating}/5 stars`,
          html,
          replyTo: email || undefined,
        });
      } catch (emailErr) {
        // Email failure is non-fatal — feedback is already saved to DB
        console.error("Email send failed:", emailErr);
      }
    } else {
      console.warn("FEEDBACK_RECIPIENT_EMAIL not set — feedback saved but email not sent");
    }

    res.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("feedback route error:", error);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
