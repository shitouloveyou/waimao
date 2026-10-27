import type { Metadata } from "next";
import {notFound} from "next/navigation";
import {getPublicProducts,getSettings} from "@/lib/store";
import {copy,isLocale,languageAlternates} from "@/lib/languages";
import Storefront from "../storefront";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
  const {lang}=await params;if(!isLocale(lang))return{};const settings=await getSettings();const t=copy[lang];const title=`${t.title} | ${settings.companyName}`;
  const image=settings.homeShareImage||"/share/home";
  return {title:{absolute:title},description:t.intro,alternates:{canonical:`/${lang}`,languages:languageAlternates()},openGraph:{title,description:t.intro,locale:{fr:"fr_FR",de:"de_DE",es:"es_ES"}[lang],images:[image]},twitter:{card:"summary_large_image",title,description:t.intro,images:[image]}};
}
export default async function Page({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLocale(lang))notFound();return <Storefront initialProducts={await getPublicProducts()} settings={await getSettings()}/>;}
