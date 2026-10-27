"use client";
import {createContext,useContext,useEffect,useState,type ReactNode,type Ref,type InputHTMLAttributes,type TextareaHTMLAttributes,type ButtonHTMLAttributes,type SelectHTMLAttributes} from "react";
import {usePathname} from "next/navigation";
import {isLocale,type Locale} from "@/lib/languages";
import {translateUI} from "@/lib/ui-translations";
export type Language="en"|Locale;
const Context=createContext<{language:Language;setLanguage:(language:Language)=>void}>({language:"en",setLanguage:()=>{}});
export function TranslationProvider({children}:{children:ReactNode}){
  const pathname=usePathname();const part=pathname.split("/")[1];const routeLanguage:Language=isLocale(part)?part:"en";
  const [language,setState]=useState<Language>(routeLanguage);
  function setLanguage(next:Language){setState(next);try{localStorage.setItem("edgevora_language",next);}catch{}}
  useEffect(()=>{if(routeLanguage!=="en")setState(routeLanguage);else{try{const saved=localStorage.getItem("edgevora_language");if(saved==="en"||isLocale(saved||""))setState(saved as Language);}catch{}}},[pathname,routeLanguage]);
  useEffect(()=>{document.documentElement.lang=pathname.startsWith("/admin")?"zh-CN":language;},[language,pathname]);
  return <Context.Provider value={{language,setLanguage}}>{children}</Context.Provider>;
}
export const useLanguage=()=>useContext(Context);
export function TranslatedText({children,translations,field}:{children:ReactNode;translations?:Partial<Record<Locale,{name?:string;description?:string}>>;field?:"name"|"description"}){
  const {language}=useLanguage();
  if(typeof children!=="string")return <>{children}</>;
  const custom=language!=="en"&&field?translations?.[language]?.[field]:undefined;
  return <>{custom?.trim()||translateUI(children,language)}</>;
}
function useAttributes(){const {language}=useLanguage();return (value:string|undefined)=>value?translateUI(value,language):value;}
export function TranslatedInput(props:InputHTMLAttributes<HTMLInputElement>&{ref?:Ref<HTMLInputElement>}){const t=useAttributes();return <input {...props} placeholder={t(props.placeholder)} title={t(props.title)} aria-label={t(props["aria-label"])}/>;}
export function TranslatedTextarea(props:TextareaHTMLAttributes<HTMLTextAreaElement>){const t=useAttributes();return <textarea {...props} placeholder={t(props.placeholder)} title={t(props.title)} aria-label={t(props["aria-label"])}/>;}
export function TranslatedButton(props:ButtonHTMLAttributes<HTMLButtonElement>){const t=useAttributes();return <button {...props} title={t(props.title)} aria-label={t(props["aria-label"])}/>;}
export function TranslatedSelect(props:SelectHTMLAttributes<HTMLSelectElement>){const t=useAttributes();return <select {...props} title={t(props.title)} aria-label={t(props["aria-label"])}/>;}
