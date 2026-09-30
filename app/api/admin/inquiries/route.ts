import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { updateInquiry } from "@/lib/store";
export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  if (typeof data.id !== "string" || !["新询盘", "已联系", "已报价", "已成交", "无效"].includes(data.stage)) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  await updateInquiry(data.id, { stage: data.stage, notes: String(data.notes || "").slice(0, 3000), followUp: String(data.followUp || "").slice(0, 10) });
  return NextResponse.json({ ok: true });
}
