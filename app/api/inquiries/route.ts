import { NextResponse } from "next/server";
import { addInquiry, getSettings } from "@/lib/store";
import type { Inquiry } from "@/lib/types";
import { recordEvent } from "@/lib/operations";
import { promises as fs } from "node:fs";
import path from "node:path";
import { clientAddress, rateLimit } from "@/lib/rate-limit";

const clean = (value: FormDataEntryValue | null, max = 500) => String(value || "").trim().slice(0, max);
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] || character);

async function notify(inquiry: Inquiry) {
  const brevoKey = process.env.BREVO_API_KEY;
  const apiKey = process.env.RESEND_API_KEY;
  const settings = await getSettings();
  const recipient = process.env.NOTIFY_EMAIL || settings.email;
  if ((!brevoKey && !apiKey) || !recipient || recipient.endsWith("@example.com")) {
    console.warn("Inquiry email notification not configured; inquiry was saved.");
    return;
  }
  const fields = [
    ["Name", inquiry.name], ["Email", inquiry.email], ["Company", inquiry.company], ["Country", inquiry.country],
    ["Request type", inquiry.requestType], ["Product", inquiry.product], ["Quantity", inquiry.quantity], ["Message", inquiry.message], ["UTM source", inquiry.utmSource],
    ["UTM medium", inquiry.utmMedium], ["UTM campaign", inquiry.utmCampaign], ["Landing page", inquiry.landingPage], ["Attachment", inquiry.attachmentUrl ? `${process.env.SITE_URL || ""}${inquiry.attachmentUrl}` : ""],
  ];
  const subject = `New inquiry: ${inquiry.product || inquiry.company || inquiry.name}`;
  const html = `<h2>New website inquiry</h2>${fields.map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value || "—")}</p>`).join("")}`;
  if (brevoKey) {
    const senderEmail = process.env.BREVO_SENDER_EMAIL || settings.email;
    if (!senderEmail || senderEmail.endsWith("@example.com")) throw new Error("Brevo sender email is not configured");
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoKey, "Content-Type": "application/json", Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        sender: { name: settings.companyName || "Website Inquiry", email: senderEmail },
        to: [{ email: recipient }],
        replyTo: { email: inquiry.email },
        subject,
        htmlContent: html,
      }),
    });
    if (!response.ok) throw new Error(`Brevo notification rejected (HTTP ${response.status})`);
    const receipt = await response.json().catch(() => null);
    console.info("Inquiry email accepted by Brevo", { inquiryId: inquiry.id, messageId: receipt?.messageId || "unavailable" });
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || "Website Inquiry <onboarding@resend.dev>",
      to: [recipient], reply_to: inquiry.email, subject, html,
    }),
  });
  if (!response.ok) throw new Error(`Resend notification rejected (HTTP ${response.status})`);
  const receipt = await response.json().catch(() => null);
  console.info("Inquiry email accepted by Resend", { inquiryId: inquiry.id, messageId: receipt?.id || "unavailable" });
}

export async function POST(request: Request) {
  const throttle = rateLimit(`inquiry:${clientAddress(request)}`, 6, 60 * 60 * 1000);
  if (!throttle.allowed) return NextResponse.json({ error: "Too many inquiries. Please try again later." }, { status: 429, headers: { "Retry-After": String(throttle.retryAfter) } });
  const form = await request.formData();
  if (clean(form.get("website"))) return NextResponse.json({ ok: true });
  const email = clean(form.get("email"), 200);
  const message = clean(form.get("message"), 3000);
  if (!/^\S+@\S+\.\S+$/.test(email) || message.length < 5) return NextResponse.json({ error: "Invalid inquiry" }, { status: 400 });
  const attachment = form.get("attachment");
  let attachmentUrl = "", attachmentName = "";
  if (attachment instanceof File && attachment.size > 0) {
    const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };
    const extension = types[attachment.type];
    if (!extension || attachment.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Attachment must be JPG, PNG, WebP or PDF and no larger than 8MB" }, { status: 400 });
    const name = `${crypto.randomUUID()}.${extension}`;
    const directory = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "uploads");
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, name), Buffer.from(await attachment.arrayBuffer()));
    attachmentUrl = `/api/uploads/${name}`;
    attachmentName = attachment.name.slice(0, 180);
  }
  const inquiry: Inquiry = {
    id: crypto.randomUUID(), name: clean(form.get("name"), 120), email,
    company: clean(form.get("company"), 160), country: clean(form.get("country"), 120),
    product: clean(form.get("product"), 200), quantity: clean(form.get("quantity"), 120), requestType: clean(form.get("requestType"), 80) || "Wholesale quote", message,
    source: clean(form.get("source"), 500), landingPage: clean(form.get("landingPage"), 800),
    utmSource: clean(form.get("utmSource"), 200), utmMedium: clean(form.get("utmMedium"), 200),
    utmCampaign: clean(form.get("utmCampaign"), 200), attachmentUrl, attachmentName, createdAt: new Date().toISOString(),
  };
  await addInquiry(inquiry);
  await recordEvent({ type: "inquiry", visitor: clean(form.get("visitor")), page: inquiry.product, source: inquiry.utmSource || inquiry.source || "Direct", campaign: inquiry.utmCampaign || "", createdAt: inquiry.createdAt }).catch(console.error);
  try { await notify(inquiry); } catch (error) { console.error("Inquiry email notification failed", error); }
  return NextResponse.json({ ok: true });
}
