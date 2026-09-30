import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getInquiries } from "@/lib/store";

const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const inquiries = await getInquiries();
  const headers = ["Submitted at", "Stage", "Priority", "Customer type", "Next follow-up", "Last contacted", "Name", "Email", "WhatsApp", "Company", "Country", "Product", "Quantity", "Deal value", "Currency", "Tags", "Source", "Campaign", "Requirements", "Attachment", "Notes"];
  const rows = inquiries.map(item => [item.createdAt, item.stage || "新询盘", item.priority || "中", item.customerType || "潜在客户", item.followUp, item.lastContactAt, item.name, item.email, item.whatsapp, item.company, item.country, item.product, item.quantity, item.dealValue, item.dealCurrency || "USD", item.tags, item.utmSource || item.source || "Direct", item.utmCampaign, item.message, item.attachmentUrl, item.notes]);
  const content = `\uFEFF${[headers, ...rows].map(row => row.map(csv).join(",")).join("\r\n")}`;
  return new NextResponse(content, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
