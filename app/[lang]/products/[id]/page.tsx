import type {Metadata} from "next";
import {notFound,permanentRedirect} from "next/navigation";
import {getPublicProduct,getPublicProducts,getSettings} from "@/lib/store";
import {isLocale,copy,languageAlternates} from "@/lib/languages";
import {translatedProduct} from "@/lib/localized-products";
import {productPath,publicProductSlug} from "@/lib/product-presentation";
import ProductPage from "../../../products/[id]/page";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{lang:string;id:string}>}):Promise<Metadata>{const {lang,id}=await params;if(!isLocale(lang))return{};const product=await getPublicProduct(id);if(!product)return{};const local=translatedProduct(product,lang);return{title:local.name,description:local.description||copy[lang].intro,alternates:{canonical:`/${lang}${productPath(product)}`,languages:languageAlternates(productPath(product))},openGraph:{title:local.name,description:local.description||copy[lang].intro,images:product.image?[product.image]:[]}};}
export default async function Page({params,searchParams}:{params:Promise<{lang:string;id:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const {lang,id}=await params;if(!isLocale(lang))notFound();const product=await getPublicProduct(id);if(!product)notFound();
  if(id!==publicProductSlug(product)){const query=new URLSearchParams();for(const [key,value]of Object.entries(await searchParams)){if(Array.isArray(value))value.forEach(item=>query.append(key,item));else if(typeof value==="string")query.set(key,value);}permanentRedirect(`/${lang}${productPath(product)}${query.size?`?${query}`:""}`);}
  return ProductPage({params:Promise.resolve({id}),searchParams});
}
