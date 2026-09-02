import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { promises as fs } from "node:fs";
import path from "node:path";
const types:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
export async function POST(request:Request){if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const form=await request.formData();const file=form.get("image");if(!(file instanceof File)||!types[file.type]||file.size>5*1024*1024)return NextResponse.json({error:"Invalid image"},{status:400});const name=`${crypto.randomUUID()}.${types[file.type]}`;const dir=path.join(process.env.DATA_DIR||path.join(process.cwd(),"data"),"uploads");await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,name),Buffer.from(await file.arrayBuffer()));return NextResponse.json({url:`/api/uploads/${name}`});}
