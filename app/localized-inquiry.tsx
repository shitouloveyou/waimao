"use client";
import { useEffect, useRef, useState } from "react";
import { copy, type Locale } from "@/lib/languages";
export default function LocalizedInquiry({locale, product=""}:{locale:Locale;product?:string}) {
  const t=copy[locale]; const [busy,setBusy]=useState(false);const [done,setDone]=useState(false);const [error,setError]=useState("");const [fileName,setFileName]=useState("");const file=useRef<HTMLInputElement>(null);const [productValue,setProductValue]=useState(product);const [requestValue,setRequestValue]=useState("Wholesale quote");
  useEffect(()=>{const params=new URLSearchParams(location.search);setProductValue(product||params.get("product")||"");setRequestValue(params.get("request")==="sample"?"Sample request":"Wholesale quote");},[product]);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;setBusy(true);setError("");
    const form=new FormData(event.currentTarget);
    try {
      try {const attribution=JSON.parse(sessionStorage.getItem("fn_attribution")||"{}"); for(const key of ["utmSource","utmMedium","utmCampaign","source","landingPage"])form.set(key,attribution[key]||"");form.set("visitor",sessionStorage.getItem("fn_visitor")||"");}catch{}
      if(!form.get("source"))form.set("source",`Website /${locale}`);
      const response=await fetch("/api/inquiries",{method:"POST",body:form});
      if(!response.ok)throw new Error();setDone(true);
      const win=window as typeof window & {gtag?:(...args:unknown[])=>void;fbq?:(...args:unknown[])=>void;ttq?:{track?:(...args:unknown[])=>void}};
      try{win.gtag?.("event","generate_lead",{language:locale,product:form.get("product")});win.fbq?.("track","Lead");win.ttq?.track?.("SubmitForm");}catch{}
    }catch{setError(t.failed);}finally{setBusy(false);}
  }
  if(done)return <div className="locale-success" role="status">{t.success}</div>;
  return <form className="locale-form" onSubmit={submit}><input className="honey" name="website" tabIndex={-1} autoComplete="off"/><div className="locale-form-grid">
    <label>{t.name}<input name="name" required autoComplete="name" maxLength={120}/></label><label>{t.email}<input name="email" type="email" required autoComplete="email" maxLength={200}/></label>
    <label>{t.company}<input name="company" autoComplete="organization" maxLength={160}/></label><label>{t.country}<input name="country" autoComplete="country-name" maxLength={120}/></label>
    <label>{t.request}<select name="requestType" value={requestValue} onChange={event=>setRequestValue(event.target.value)}><option value="Wholesale quote">{t.wholesale}</option><option value="Sample request">{t.sampleOption}</option></select></label>
    <label>{t.product}<input name="product" value={productValue} onChange={event=>setProductValue(event.target.value)} maxLength={200}/></label><label>{t.quantity}<input name="quantity" maxLength={120}/></label>
    <label>{t.attachment}<input ref={file} hidden type="file" name="attachment" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setFileName(e.target.files?.[0]?.name||"")}/><button type="button" onClick={()=>file.current?.click()}>{t.choose}</button><small>{fileName||t.noFile}</small><small>{t.fileNote}</small></label>
  </div><label>{t.requirements}<textarea name="message" required maxLength={3000} rows={5}/></label>{error&&<p role="alert">{error}</p>}<button className="primary" type="submit" disabled={busy}>{busy?t.sending:t.send}</button><small>{t.privacy}</small></form>;
}
