import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { getPublicProducts, getSettings } from "@/lib/store";
import PrintButton from "./print-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wholesale Hardware Product Catalog", description: "Browse and download our current wholesale tools, scissors and hardware product catalog." };

export default async function CatalogPage() {
  const products = await getPublicProducts();
  const settings = await getSettings();
  const categories = Array.from(new Set(products.map(product => product.category)));
  return <main className="catalog-page">
    <header className="catalog-toolbar"><Link href="/"><ArrowLeft /> Back to website</Link><PrintButton /></header>
    <section className="catalog-cover"><div className="catalog-mark">FN</div><span>WHOLESALE · OEM · PRIVATE LABEL</span><h1>{settings.companyName}</h1><p>Tools, scissors and hardware products for distributors, retailers and sourcing programs.</p><div><span>{products.length} Products</span><span>{categories.length} Categories</span></div></section>
    {categories.map(category => <section className="catalog-category" key={category}><header><span>PRODUCT CATEGORY</span><h2>{category}</h2></header><div>{products.filter(product => product.category === category).map(product => <article key={product.id}><div className="catalog-image" style={product.image ? { backgroundImage: `url(${product.image})`, backgroundPosition: product.imagePosition || "center", backgroundSize: product.imagePosition ? "300% 200%" : "cover" } : undefined} /><div className="catalog-copy"><small>{product.sku || product.model || "OEM AVAILABLE"}</small><h3>{product.name}</h3><p>{product.description}</p><dl><div><dt>Material</dt><dd>{product.material || "To specification"}</dd></div><div><dt>Size</dt><dd>{product.size || "Custom options"}</dd></div><div><dt>MOQ</dt><dd>{product.moq || "Confirm with quote"}</dd></div><div><dt>Lead time</dt><dd>{product.leadTime || "Confirm with quote"}</dd></div></dl><Link href={`/products/${product.id}`}>View online</Link></div></article>)}</div></section>)}
    <footer className="catalog-contact"><div><span>START YOUR SOURCING PROJECT</span><h2>Request pricing, samples or OEM options.</h2></div><div><a href={`mailto:${settings.email}`}><Mail /> {settings.email}</a><a href={settings.whatsapp.startsWith("http") ? settings.whatsapp : "/#quote"}><MessageCircle /> {settings.whatsapp}</a></div></footer>
  </main>;
}
