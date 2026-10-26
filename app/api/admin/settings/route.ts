import { secureEndpoint, readJson } from "@/lib/request-security";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { saveSettings } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";
async function handlePUT(request:Request){if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const settings=await readJson(request, 1024 * 1024) as SiteSettings;if(!settings.companyName)return NextResponse.json({error:"Invalid settings"},{status:400});if(settings.googleAnalyticsId&&!/^G-[A-Z0-9]+$/i.test(settings.googleAnalyticsId))return NextResponse.json({error:"Invalid Google Analytics ID"},{status:400});if(settings.metaPixelId&&!/^\d{5,30}$/.test(settings.metaPixelId))return NextResponse.json({error:"Invalid Meta Pixel ID"},{status:400});if(settings.tiktokPixelId&&!/^[A-Z0-9]{10,30}$/i.test(settings.tiktokPixelId))return NextResponse.json({error:"Invalid TikTok Pixel ID"},{status:400});settings.heroVideos=(settings.heroVideos||[]).filter(video=>/^\/api\/uploads\/[a-f0-9-]+\.(mp4|webm)$/i.test(video.url)).slice(0,5);await saveSettings(settings);return NextResponse.json({ok:true});}

export const PUT = secureEndpoint(handlePUT, true);
