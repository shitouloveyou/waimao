import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getInquiries, getProducts, getSettings } from "@/lib/store";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const backup = { version: 1, exportedAt: new Date().toISOString(), products: await getProducts(), inquiries: await getInquiries(), settings: await getSettings() };
  return new NextResponse(JSON.stringify(backup, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="forgenova-backup-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "no-store" } });
}
