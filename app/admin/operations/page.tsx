import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getEvents } from "@/lib/operations";
import { getInquiries, getProducts } from "@/lib/store";
import Operations from "../operations";
import Followups from "../followups";
export const dynamic = "force-dynamic";
export default async function Page() {
  if (!await isAdmin()) redirect("/admin");
  const [events, inquiries, products] = await Promise.all([getEvents(), getInquiries(), getProducts()]);
  return <main className="ops-page"><a href="/admin">← 返回管理后台</a><Operations events={events} inquiries={inquiries} products={products} /><Followups inquiries={inquiries} /></main>;
}
