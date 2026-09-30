import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/operations";
import { clientAddress, rateLimit } from "@/lib/rate-limit";
export async function POST(request: Request) {
  const throttle = rateLimit(`event:${clientAddress(request)}`, 300, 60 * 1000);
  if (!throttle.allowed) return NextResponse.json({ error: "Too many events" }, { status: 429, headers: { "Retry-After": String(throttle.retryAfter) } });
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const data = await request.json().catch(() => null);
  if (!data || !["view", "product_click", "whatsapp"].includes(data.type) || typeof data.visitor !== "string") return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const clean = (value: unknown) => String(value || "").slice(0, 240);
  await recordEvent({ type: data.type, visitor: clean(data.visitor), page: clean(data.page), source: clean(data.source), campaign: clean(data.campaign), createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
