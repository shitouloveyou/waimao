import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { addInquiry, updateInquiry } from "@/lib/store";
import type { Inquiry } from "@/lib/types";
const stages = ["新询盘", "待联系", "已联系", "需求确认", "已报价", "谈判中", "已成交", "暂缓", "无效"];
export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  if (typeof data.id !== "string" || !stages.includes(data.stage)) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  await updateInquiry(data.id, { stage: data.stage, notes: String(data.notes || "").slice(0, 5000), followUp: String(data.followUp || "").slice(0, 10), priority: ["高","中","低"].includes(data.priority) ? data.priority : "中", customerType: String(data.customerType || "潜在客户").slice(0,80), whatsapp: String(data.whatsapp || "").slice(0,120), tags: String(data.tags || "").slice(0,300), dealValue: Math.max(0,Number(data.dealValue)||0), dealCurrency: String(data.dealCurrency||"USD").slice(0,10), lastContactAt: String(data.lastContactAt||"").slice(0,10) });
  return NextResponse.json({ ok: true });
}
export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  const name = String(data.name||"").trim().slice(0,120), email = String(data.email||"").trim().slice(0,200);
  if (!name && !email) return NextResponse.json({ error: "Name or email required" }, { status: 400 });
  const customer: Inquiry = { id: crypto.randomUUID(), name, email, company:String(data.company||"").slice(0,160), country:String(data.country||"").slice(0,120), product:String(data.product||"").slice(0,500), quantity:"", requestType:"后台新增客户", message:"手动创建的客户档案", createdAt:new Date().toISOString(), stage:"待联系", priority:"中", customerType:"潜在客户", whatsapp:String(data.whatsapp||"").slice(0,120), dealCurrency:"USD" };
  await addInquiry(customer);
  return NextResponse.json({ ok:true, customer });
}
