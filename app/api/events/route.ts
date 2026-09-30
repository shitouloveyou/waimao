import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/operations";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const data = await request.json().catch(() => null);
  if (!data || !["view", "product_click", "whatsapp"].includes(data.type) || typeof data.visitor !== "string") return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const clean = (value: unknown) => String(value || "").slice(0, 240);
  await recordEvent({ type: data.type, visitor: clean(data.visitor), page: clean(data.page), source: clean(data.source), campaign: clean(data.campaign), createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
