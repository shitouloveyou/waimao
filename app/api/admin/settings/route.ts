import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { saveSettings } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";
export async function PUT(request:Request){if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const settings=await request.json() as SiteSettings;if(!settings.companyName||!settings.email)return NextResponse.json({error:"Invalid settings"},{status:400});await saveSettings(settings);return NextResponse.json({ok:true});}
