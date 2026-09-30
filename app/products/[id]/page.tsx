import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublicProduct, getPublicProducts, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const product = await getPublicProduct((await params).id);
  if (!product) return {};
  return {
    title: `${product.name} | Wholesale & OEM`,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images: product.image ? [product.image] : [] },
  };
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const product = await getPublicProduct((await params).id);
  if (!product) notFound();
  const settings = await getSettings();
  const incoming = await searchParams;
  const quoteParams = new URLSearchParams({ product: product.name });
  for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
    const value = incoming[key];
    if (typeof value === "string") quoteParams.set(key, value);
  }
  const quoteUrl = `/?${quoteParams.toString()}#quote`;
  quoteParams.set("request", "sample");
  const sampleUrl = `/?${quoteParams.toString()}#quote`;
  const features = (product.features || "").split("|").filter(Boolean);
  const whatsapp = settings.whatsapp.startsWith("http") ? `${settings.whatsapp}${settings.whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(`Hello, I would like a quote for ${product.name}.`)}` : quoteUrl;
  const imageStyle = product.image ? { backgroundImage: `url(${product.image})`, backgroundPosition: product.imagePosition || "center", backgroundSize: product.imagePosition ? "300% 200%" : "cover" } : undefined;

  return <main className="detail-page">
    <header className="detail-nav"><Link href="/"><ArrowLeft /> Back to products</Link><b>{settings.companyName}</b><Link className="detail-quote" href={quoteUrl}>Request quote</Link></header>
    <section className="detail-hero">
      <div className="detail-image" style={imageStyle} />
      <div className="detail-copy"><span className="kicker">{product.category}</span><h1>{product.name}</h1><p>{product.description}</p><div className="detail-actions"><Link className="primary" href={quoteUrl}>Request a quotation <ArrowRight /></Link><Link className="sample-button" href={sampleUrl}>Request a sample</Link><a className="whatsapp-button" href={whatsapp}><MessageCircle /> WhatsApp</a></div><small>Samples, private label and packaging options available.</small></div>
    </section>
    <section className="spec-section"><div><span className="kicker">PRODUCT SPECIFICATION</span><h2>A practical starting point for your program.</h2></div><dl><div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>Blade</dt><dd>{product.blade || "To specification"}</dd></div><div><dt>Size</dt><dd>{product.size || "Custom options"}</dd></div><div><dt>MOQ</dt><dd>{product.moq}</dd></div><div><dt>Lead time</dt><dd>{product.leadTime || "Confirm with quote"}</dd></div><div><dt>Applications</dt><dd>{product.applications || "Wholesale and retail programs"}</dd></div></dl></section>
    <section className="feature-section"><div><span className="kicker">OEM & PRIVATE LABEL</span><h2>Adapt it to your market.</h2><p>{product.customization || "Logo, color and packaging can be developed around your sales channel."}</p></div><ul>{features.map(feature => <li key={feature}><Check />{feature}</li>)}<li><Check />Pre-production sample confirmation</li><li><Check />Export-ready packing and inspection</li></ul></section>
    <section className="detail-cta"><h2>Have a reference product or target price?</h2><p>Send the link, photo or specification and we will help identify a suitable production option.</p><Link className="primary" href={quoteUrl}>Start your inquiry <ArrowRight /></Link></section>
    <div className="mobile-contact-bar"><Link href={sampleUrl}>Request Sample</Link><a href={whatsapp}><MessageCircle /> WhatsApp</a></div>
  </main>;
}

export async function generateStaticParams() {
  return (await getPublicProducts()).map(product => ({ id: product.id }));
}
