"use client";
import {usePathname} from "next/navigation";
import {languages} from "@/lib/languages";
import {useLanguage} from "./translation-context";
export default function LanguageSwitcher(){const pathname=usePathname();const{language,setLanguage}=useLanguage();if(pathname.startsWith("/admin"))return null;return <div className="language-bar"><nav aria-label="Language">{languages.map(item=><button key={item.code} type="button" lang={item.code} aria-pressed={language===item.code} onClick={()=>setLanguage(item.code)}>{item.name}</button>)}</nav></div>;}
