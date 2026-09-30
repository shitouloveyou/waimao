import { getInquiries, getProducts, getSettings } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import AdminPanel from "./panel";
import { getEvents } from "@/lib/operations";
export const dynamic = "force-dynamic";
export default async function Admin() { const authed = await isAdmin(); return <AdminPanel initialAuthed={authed} events={authed ? await getEvents() : []} initialProducts={authed ? await getProducts() : []} inquiries={authed ? await getInquiries() : []} initialSettings={authed ? await getSettings() : {companyName:"",email:"",whatsapp:"",wechat:"",about:""}}/>; }
