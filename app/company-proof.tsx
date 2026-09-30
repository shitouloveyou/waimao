import { Check } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export default function CompanyProof({ settings }: { settings: SiteSettings }) {
  const certifications = (settings.certifications || "").split("|").map(item=>item.trim()).filter(Boolean);
  const process = (settings.qualityProcess || "").split("|").map(item=>item.trim()).filter(Boolean);
  const facts = [["Trade terms",settings.tradeTerms],["Payment",settings.paymentTerms],["Export markets",settings.exportMarkets]].filter((item):item is [string,string]=>Boolean(item[1]));
  if (!settings.companyImages?.length && !certifications.length && !process.length && !facts.length) return null;
  return <section className="company-proof"><div className="section-head"><div><span className="kicker">MANUFACTURING & QUALITY</span><h2>Evidence behind every quotation.</h2></div><p>Company, quality and trade information for buyer review. Ask us for supporting documents relevant to your product and market.</p></div>{Boolean(settings.companyImages?.length)&&<div className="company-photo-grid">{settings.companyImages!.map((image,index)=><img src={image} alt={`${settings.companyName} facility and quality ${index+1}`} key={`${image}-${index}`}/>)}</div>}{certifications.length>0&&<div className="certification-list"><span>Certifications / standards</span>{certifications.map(item=><b key={item}>{item}</b>)}</div>}{facts.length>0&&<div className="trade-facts">{facts.map(([label,value])=><article key={label}><small>{label}</small><strong>{value}</strong></article>)}</div>}{process.length>0&&<div className="quality-process"><h3>Quality process</h3><ol>{process.map((item,index)=><li key={item}><span>{String(index+1).padStart(2,"0")}</span><Check/><b>{item}</b></li>)}</ol></div>}</section>;
}
