import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isAdmin } from "@/lib/auth";
import { secureEndpoint } from "@/lib/request-security";
const mime: Record<string,string> = { jpg:"image/jpeg", png:"image/png", webp:"image/webp", pdf:"application/pdf" };
async function attachment(request: Request, {params}: {params: Promise<{name:string}>}) {
  if (!await isAdmin()) return new NextResponse("Sign in to the website admin to view this attachment.", {status:401});
  const {name} = await params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp|pdf)$/i.test(name)) return new NextResponse("Not found", {status:404});
  try {
    const data = await fs.readFile(path.join(process.env.DATA_DIR || path.join(process.cwd(),"data"),"private-uploads",name));
    const extension = name.split(".").pop()!.toLowerCase();
    return new NextResponse(data, {headers:{"Content-Type":mime[extension],"X-Content-Type-Options":"nosniff","Content-Length":String(data.length),"Content-Disposition":`${extension === "pdf" ? "attachment" : "inline"}; filename="${name}"`}});
  } catch { return new NextResponse("Not found", {status:404}); }
}
export const GET = secureEndpoint(attachment, false);
