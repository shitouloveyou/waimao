"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { languages, isLocale } from "@/lib/languages";
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const active = isLocale(segments[0] || "") ? segments[0] : "en";
  const rest = active === "en" ? pathname : "/" + segments.slice(1).join("/");
  // Only product pages have a direct translated counterpart; other pages link to the language homepage.
  const target = rest.startsWith("/products/") ? rest : "/";
  useEffect(() => { document.documentElement.lang = active; }, [active]);
  if (pathname.startsWith("/admin")) return null;
  return <div className="language-bar"><nav aria-label="Language">{languages.map(item=><a key={item.code} href={item.code === "en" ? target : `/${item.code}${target === "/" ? "" : target}`} hrefLang={item.code} lang={item.code} aria-current={active===item.code?"page":undefined} onClick={event=>{ const url = new URL(event.currentTarget.href); url.search = location.search; url.hash = target===rest ? location.hash : ""; event.currentTarget.href=url.href; }}>{item.name}</a>)}</nav></div>;
}
