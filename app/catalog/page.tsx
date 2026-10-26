import { productPath, isGardenCatalog, productImageStyle } from "@/lib/product-presentation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { getPublicProducts, getSettings } from "@/lib/store";
import PrintButton from "./print-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wholesale Hardware Product Catalog", description: "Browse our current product range and request wholesale pricing and samples.", alternates: { canonical: "/catalog" } };

export default async function CatalogPage() {
  const products = await getPublicProducts();
  const settings = await getSettings();
  const categories = Array.from(new Set(products.map(product => product.category)));
  return <main className="catalog-page">
    <header className="catalog-toolbar"><Link href="/"><ArrowLeft /> Back to website</Link><PrintButton /></header>
    <section className="catalog-cover"><div className={settings.logo?"catalog-mark has-logo":"catalog-mark"}>{settings.logo?<img src={settings.logo} alt={`${settings.companyName} logo`}/>:"EV"}</div><span>WHOLESALE · OEM · PRIVATE LABEL</span><h1>{settings.companyName}</h1><p>{isGardenCatalog(products) ? "Garden pruning shears for distributors, garden retailers and sourcing programs." : "Browse our current tools for distributors, retailers and sourcing programs."}</p><div><span>{products.length} Products</span><span>{categories.length} Categories</span></div></section>
    {categories.map(category => <section className="catalog-category" key={category}><header><span>PRODUCT CATEGORY</span><h2>{category}</h2></header><div>{products.filter(product => product.category === category).map(product => <article key={product.id}><div className="catalog-image" style={productImageStyle(product)} /><div className="catalog-copy"><small>{product.sku || product.model || "WHOLESALE INQUIRIES"}</small><h3>{product.name}</h3><p>{product.description}</p><dl><div><dt>Material</dt><dd>{product.material || "To specification"}</dd></div><div><dt>Size</dt><dd>{product.size || "To be confirmed"}</dd></div><div><dt>MOQ</dt><dd>{product.moq || "Confirm with quote"}</dd></div><div><dt>Lead time</dt><dd>{product.leadTime || "Confirm with quote"}</dd></div></dl><Link href={productPath(product)}>View online</Link></div></article>)}</div></section>)}
    <footer className="catalog-contact"><div><span>START YOUR SOURCING PROJECT</span><h2>Request pricing, samples or OEM options.</h2></div><div>{settings.email&&<a href={`mailto:${settings.email}`}><Mail /> {settings.email}</a>}{settings.whatsapp.startsWith("http")&&<a href={settings.whatsapp}><MessageCircle /> WhatsApp</a>}<Link href="/#quote">Send an inquiry</Link></div></footer>
  </main>;
}
