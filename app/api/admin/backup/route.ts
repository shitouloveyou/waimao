import { secureEndpoint } from "@/lib/request-security";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getInquiries, getOrders, getProducts, getSettings } from "@/lib/store";

async function handleGET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const backup = { version: 1, exportedAt: new Date().toISOString(), products: await getProducts(), inquiries: await getInquiries(), orders: await getOrders(), settings: await getSettings() };
  return new NextResponse(JSON.stringify(backup, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="edgevora-backup-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "no-store" } });
}

export const GET = secureEndpoint(handleGET, false);
