import { getInquiries, getProducts, getSettings } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import AdminPanel from "./panel";
export const dynamic = "force-dynamic";
export default async function Admin() { const authed = await isAdmin(); return <AdminPanel initialAuthed={authed} initialProducts={authed ? await getProducts() : []} inquiries={authed ? await getInquiries() : []} initialSettings={authed ? await getSettings() : {companyName:"",email:"",whatsapp:"",wechat:"",about:""}}/>; }
