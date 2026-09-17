import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailPayload {
  to: string;
  subject: string;
  headline: string;
  body: string;
  actionText?: string;
  actionUrl?: string;
}

export async function sendTransactionalEmail({
  to,
  subject,
  headline,
  body,
  actionText = "Open SkillSwap Dashboard",
  actionUrl = "http://localhost:3000/dashboard",
}: EmailPayload) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured. Skipping email dispatch.");
    return { success: false, reason: "Missing API Key" };
  }

  try {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
          SkillSwap 🔄
        </div>
        <h2 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-top: 0;">${headline}</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">${body}</p>
        <div style="margin: 28px 0;">
          <a href="${actionUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
            ${actionText}
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          This is an automated notification from your SkillSwap peer learning account.
        </p>
      </div>
    `;

    const data = await resend.emails.send({
      from: "SkillSwap <notifications@resend.dev>",
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Email dispatch failed:", error);
    return { success: false, error: error.message };
  }
}