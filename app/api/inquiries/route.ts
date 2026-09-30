import { NextResponse } from "next/server";
import { addInquiry, getSettings } from "@/lib/store";
import type { Inquiry } from "@/lib/types";
import { recordEvent } from "@/lib/operations";

const clean = (value: FormDataEntryValue | null, max = 500) => String(value || "").trim().slice(0, max);
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] || character);

async function notify(inquiry: Inquiry) {
  const apiKey = process.env.RESEND_API_KEY;
  const settings = await getSettings();
  const recipient = process.env.NOTIFY_EMAIL || settings.email;
  if (!apiKey || !recipient || recipient.endsWith("@example.com")) return;
  const fields = [
    ["Name", inquiry.name], ["Email", inquiry.email], ["Company", inquiry.company], ["Country", inquiry.country],
    ["Product", inquiry.product], ["Quantity", inquiry.quantity], ["Message", inquiry.message], ["UTM source", inquiry.utmSource],
    ["UTM medium", inquiry.utmMedium], ["UTM campaign", inquiry.utmCampaign], ["Landing page", inquiry.landingPage],
  ];
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || "Website Inquiry <onboarding@resend.dev>",
      to: [recipient],
      reply_to: inquiry.email,
      subject: `New inquiry: ${inquiry.product || inquiry.company || inquiry.name}`,
      html: `<h2>New website inquiry</h2>${fields.map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value || "—")}</p>`).join("")}`,
    }),
  });
  if (!response.ok) throw new Error("Email provider rejected notification");
}

export async function POST(request: Request) {
  const form = await request.formData();
  if (clean(form.get("website"))) return NextResponse.json({ ok: true });
  const email = clean(form.get("email"), 200);
  const message = clean(form.get("message"), 3000);
  if (!/^\S+@\S+\.\S+$/.test(email) || message.length < 5) return NextResponse.json({ error: "Invalid inquiry" }, { status: 400 });
  const inquiry: Inquiry = {
    id: crypto.randomUUID(), name: clean(form.get("name"), 120), email,
    company: clean(form.get("company"), 160), country: clean(form.get("country"), 120),
    product: clean(form.get("product"), 200), quantity: clean(form.get("quantity"), 120), message,
    source: clean(form.get("source"), 500), landingPage: clean(form.get("landingPage"), 800),
    utmSource: clean(form.get("utmSource"), 200), utmMedium: clean(form.get("utmMedium"), 200),
    utmCampaign: clean(form.get("utmCampaign"), 200), createdAt: new Date().toISOString(),
  };
  await addInquiry(inquiry);
  await recordEvent({ type: "inquiry", visitor: clean(form.get("visitor")), page: inquiry.product, source: inquiry.utmSource || inquiry.source || "Direct", campaign: inquiry.utmCampaign || "", createdAt: inquiry.createdAt }).catch(console.error);
  try { await notify(inquiry); } catch (error) { console.error("Inquiry email notification failed", error); }
  return NextResponse.json({ ok: true });
}
