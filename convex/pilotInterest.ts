import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const submitInterest = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.string(),
    role: v.optional(v.string()),
    useCase: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("pilotInterest", {
      ...args,
      submittedAt: Date.now(),
      emailSent: false,
    });
    return id;
  },
});

export const sendNotificationEmail = action({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.string(),
    role: v.optional(v.string()),
    useCase: v.optional(v.string()),
    recordId: v.id("pilotInterest"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not set — email not sent");
      return;
    }

    const body = {
      from: "Valence AI <onboarding@resend.dev>",
      to: ["arpitdhamija.ai@gmail.com"],
      reply_to: args.email,
      subject: `🚀 New Pilot Interest — ${args.company} (${args.name})`,
      html: `
        <div style="font-family: monospace; background: #0a0a0f; color: #e2e8f0; padding: 32px; border-radius: 12px; max-width: 600px;">
          <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px;">
            <h2 style="color: #6366f1; margin: 0; font-size: 18px;">⚡ New Pilot Interest Submission</h2>
            <p style="color: #64748b; margin: 4px 0 0; font-size: 12px;">Valence AI — Selective Pilot Program</p>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #64748b; font-size: 11px; padding: 6px 0; text-transform: uppercase; letter-spacing: 1px; width: 100px;">Name</td>
              <td style="color: #e2e8f0; font-size: 14px; padding: 6px 0; font-weight: bold;">${args.name}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 11px; padding: 6px 0; text-transform: uppercase; letter-spacing: 1px;">Email</td>
              <td style="font-size: 14px; padding: 6px 0;"><a href="mailto:${args.email}" style="color: #6366f1;">${args.email}</a></td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 11px; padding: 6px 0; text-transform: uppercase; letter-spacing: 1px;">Company</td>
              <td style="color: #e2e8f0; font-size: 14px; padding: 6px 0;">${args.company}</td>
            </tr>
            ${args.role ? `<tr>
              <td style="color: #64748b; font-size: 11px; padding: 6px 0; text-transform: uppercase; letter-spacing: 1px;">Role</td>
              <td style="color: #e2e8f0; font-size: 14px; padding: 6px 0;">${args.role}</td>
            </tr>` : ""}
            ${args.useCase ? `<tr>
              <td style="color: #64748b; font-size: 11px; padding: 6px 0; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Use Case</td>
              <td style="color: #e2e8f0; font-size: 14px; padding: 6px 0; line-height: 1.6;">${args.useCase}</td>
            </tr>` : ""}
          </table>

          <div style="margin-top: 24px; padding: 12px 16px; background: #1e293b; border-radius: 8px; border-left: 3px solid #6366f1;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Reply directly to this email to reach ${args.name} at ${args.email}</p>
          </div>
        </div>
      `,
    };

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await ctx.runMutation(api.pilotInterest.markEmailSent, { id: args.recordId });
      } else {
        const err = await res.text();
        console.error("Resend error:", err);
      }
    } catch (e) {
      console.error("Failed to send email:", e);
    }
  },
});

export const markEmailSent = mutation({
  args: { id: v.id("pilotInterest") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { emailSent: true });
  },
});
