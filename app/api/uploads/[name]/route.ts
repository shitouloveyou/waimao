import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
const mime:Record<string,string>={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",pdf:"application/pdf"};
export async function GET(_:Request,{params}:{params:Promise<{name:string}>}){const {name}=await params;if(!/^[a-f0-9-]+\.(jpg|png|webp|pdf)$/i.test(name))return new NextResponse("Not found",{status:404});try{const dir=path.join(process.env.DATA_DIR||path.join(process.cwd(),"data"),"uploads");const data=await fs.readFile(path.join(dir,name));return new NextResponse(data,{headers:{"Content-Type":mime[name.split(".").pop()!.toLowerCase()]||"application/octet-stream","Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});}catch{return new NextResponse("Not found",{status:404});}}
