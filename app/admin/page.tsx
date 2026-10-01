import { getInquiries, getOrders, getProducts, getSettings } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import AdminPanel from "./panel";
import { getEvents } from "@/lib/operations";
import type { DeploymentReadiness } from "./operations";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const authed = await isAdmin();
  const readiness: DeploymentReadiness = {
    siteUrl: Boolean(process.env.SITE_URL && !process.env.SITE_URL.includes("example.com")),
    emailNotifications: Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL),
    secureAdminPassword: Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD !== "admin123"),
    secureSession: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET !== "change-this-session-secret"),
  };
  return <AdminPanel initialAuthed={authed} events={authed ? await getEvents() : []} initialProducts={authed ? await getProducts() : []} inquiries={authed ? await getInquiries() : []} initialOrders={authed ? await getOrders() : []} initialSettings={authed ? await getSettings() : { companyName: "", email: "", whatsapp: "", wechat: "", about: "" }} readiness={readiness} />;
}
