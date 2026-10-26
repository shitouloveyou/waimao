import { secureEndpoint, readJson } from "@/lib/request-security";
import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/operations";
import { clientAddress, rateLimit } from "@/lib/rate-limit";
async function handlePOST(request: Request) {
  const globalLimit = rateLimit("event:global", 1000, 60000);
  if (!globalLimit.allowed) return NextResponse.json({error:"Too many requests. Please try again later."},{status:429,headers:{"Retry-After":String(globalLimit.retryAfter)}});
  const throttle = rateLimit(`event:${clientAddress(request)}`, 300, 60 * 1000);
  if (!throttle.allowed) return NextResponse.json({ error: "Too many events" }, { status: 429, headers: { "Retry-After": String(throttle.retryAfter) } });
  const data = await readJson(request, 8192);
  if (!data || !["view", "product_click", "whatsapp"].includes(data.type) || typeof data.visitor !== "string") return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const clean = (value: unknown) => String(value || "").slice(0, 240);
  await recordEvent({ type: data.type, visitor: clean(data.visitor), page: clean(data.page), source: clean(data.source), campaign: clean(data.campaign), createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}

export const POST = secureEndpoint(handlePOST);
