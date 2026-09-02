import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
const mime:Record<string,string>={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp"};
export async function GET(_:Request,{params}:{params:Promise<{name:string}>}){const {name}=await params;if(!/^[a-f0-9-]+\.(jpg|png|webp)$/i.test(name))return new NextResponse("Not found",{status:404});try{const dir=path.join(process.env.DATA_DIR||path.join(process.cwd(),"data"),"uploads");const data=await fs.readFile(path.join(dir,name));return new NextResponse(data,{headers:{"Content-Type":mime[name.split(".").pop()!.toLowerCase()]||"application/octet-stream","Cache-Control":"public, max-age=31536000, immutable"}});}catch{return new NextResponse("Not found",{status:404});}}
