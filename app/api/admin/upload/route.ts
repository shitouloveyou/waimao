import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { promises as fs } from "node:fs";
import path from "node:path";
const types:Record<string,{extension:string;limit:number}>={
  "image/jpeg":{extension:"jpg",limit:5*1024*1024},
  "image/png":{extension:"png",limit:5*1024*1024},
  "image/webp":{extension:"webp",limit:5*1024*1024},
  "video/mp4":{extension:"mp4",limit:8*1024*1024},
  "video/webm":{extension:"webm",limit:8*1024*1024},
};
export async function POST(request:Request){if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const form=await request.formData();const file=form.get("file")||form.get("image");if(!(file instanceof File)){return NextResponse.json({error:"Missing file"},{status:400});}const type=types[file.type];if(!type||file.size>type.limit)return NextResponse.json({error:"Invalid file"},{status:400});const name=`${crypto.randomUUID()}.${type.extension}`;const dir=path.join(process.env.DATA_DIR||path.join(process.cwd(),"data"),"uploads");await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,name),Buffer.from(await file.arrayBuffer()));return NextResponse.json({url:`/api/uploads/${name}`});}
