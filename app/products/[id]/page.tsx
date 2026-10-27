import { TranslatedText, TranslatedInput, TranslatedTextarea, TranslatedButton, TranslatedSelect } from "@/app/translation-context";
import type { Metadata } from "next";
import { languageAlternates } from "@/lib/languages";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Play } from "lucide-react";
import { customizationCopy, productPath, productImageStyle, publicProductSlug } from "@/lib/product-presentation";
import { permanentRedirect, notFound } from "next/navigation";
import { getPublicProduct, getPublicProducts, getSettings } from "@/lib/store";
import ProductGallery from "./product-gallery";
import ShareButton from "./share-button";
import { categorySlug } from "@/lib/slug";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: {
    params: Promise<{
        id: string;
    }>;
}): Promise<Metadata> {
    const product = await getPublicProduct((await params).id);
    if (!product)
        return {};
    return {
        title: product.seoTitle?.replace(/\s*\|\s*Edgevora Tools\s*$/i, "") || `${product.name} | Wholesale`,
        description: product.seoDescription || product.description,
        alternates: { canonical: productPath(product), languages: languageAlternates(productPath(product)) },
        openGraph: { title: product.seoTitle || product.name, description: product.seoDescription || product.description, images: [product.image, ...(product.images || [])].filter((image): image is string => Boolean(image)) },
    };
}
export default async function ProductPage({ params, searchParams }: {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const id = (await params).id;
    const product = await getPublicProduct(id);
    if (!product)
        notFound();
    if (id !== publicProductSlug(product)) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(await searchParams)) {
            if (Array.isArray(value))
                value.forEach(item => query.append(key, item));
            else if (typeof value === "string")
                query.set(key, value);
        }
        permanentRedirect(`${productPath(product)}${query.size ? `?${query}` : ""}`);
    }
    const settings = await getSettings();
    const allProducts = await getPublicProducts();
    const incoming = await searchParams;
    const quoteParams = new URLSearchParams({ product: product.name });
    for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
        const value = incoming[key];
        if (typeof value === "string")
            quoteParams.set(key, value);
    }
    const quoteUrl = `/?${quoteParams.toString()}#quote`;
    quoteParams.set("request", "sample");
    const sampleUrl = `/?${quoteParams.toString()}#quote`;
    const features = (product.features || "").split("|").filter(Boolean);
    const extraSpecifications = (product.specifications || "").split("\n").map(line => line.split(":")).filter(parts => parts.length > 1).map(([name, ...value]) => [name.trim(), value.join(":").trim()]);
    const whatsapp = settings.whatsapp.startsWith("http") ? `${settings.whatsapp}${settings.whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(`Hello, I would like a quote for ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ""}. ${process.env.SITE_URL ? `${process.env.SITE_URL}${productPath(product)}` : ""}`)}` : "";
    const images = [product.image, ...(product.images || [])].filter((image, index, items): image is string => Boolean(image) && items.indexOf(image) === index);
    const related = allProducts.filter(item => item.id !== product.id && item.category === product.category).slice(0, 3);
    const base = process.env.SITE_URL || "https://edgevoratools.com";
    const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: base }, { "@type": "ListItem", position: 2, name: product.category, item: `${base}/categories/${categorySlug(product.category)}` }, { "@type": "ListItem", position: 3, name: product.name, item: `${base}${productPath(product)}` }] };
    return <main className="detail-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }}/>
    <header className="detail-nav"><Link href="/"><ArrowLeft /><TranslatedText>{" Back to products"}</TranslatedText></Link><b><TranslatedText>{settings.companyName}</TranslatedText></b><Link className="detail-quote" href={quoteUrl}><TranslatedText>{"Request quote"}</TranslatedText></Link></header>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/"><TranslatedText>{"Home"}</TranslatedText></Link><span><TranslatedText>{"/"}</TranslatedText></span><Link href={`/categories/${categorySlug(product.category)}`}><TranslatedText>{product.category}</TranslatedText></Link><span><TranslatedText>{"/"}</TranslatedText></span><b><TranslatedText field="name" translations={product.translations}>{product.name}</TranslatedText></b></nav>
    <section className="detail-hero">
      <ProductGallery images={images} name={product.name} initialPosition={product.imagePosition} imageAlt={product.imageAlt}/>
      <div className="detail-copy"><span className="kicker"><TranslatedText>{product.category}</TranslatedText></span><h1><TranslatedText field="name" translations={product.translations}>{product.name}</TranslatedText></h1><p><TranslatedText field="description" translations={product.translations}>{product.description}</TranslatedText></p><div className="detail-actions"><Link className="primary" href={quoteUrl}><TranslatedText>{"Request a quotation "}</TranslatedText><ArrowRight /></Link><Link className="sample-button" href={sampleUrl}><TranslatedText>{"Request a sample"}</TranslatedText></Link>{whatsapp && <a className="whatsapp-button" href={whatsapp}><MessageCircle /><TranslatedText>{" WhatsApp"}</TranslatedText></a>}{product.videoUrl && <a className="video-button" href={product.videoUrl} target="_blank" rel="noreferrer"><Play /><TranslatedText>{" Watch video"}</TranslatedText></a>}</div><div className="detail-meta"><small><TranslatedText>{"Ask about samples and packaging. Availability and minimum quantities are confirmed per model."}</TranslatedText></small><ShareButton title={product.name}/></div></div>
    </section>
    <section className="spec-section"><div><span className="kicker"><TranslatedText>{"PRODUCT SPECIFICATION"}</TranslatedText></span><h2><TranslatedText>{"Technical details for buyer review."}</TranslatedText></h2>{product.sku && <p className="detail-sku"><TranslatedText>{"SKU: "}</TranslatedText><TranslatedText>{product.sku}</TranslatedText></p>}</div><dl>{product.model && <div><dt><TranslatedText>{"Model"}</TranslatedText></dt><dd><TranslatedText>{product.model}</TranslatedText></dd></div>}<div><dt><TranslatedText>{"Material"}</TranslatedText></dt><dd><TranslatedText>{product.material}</TranslatedText></dd></div>{product.blade && <div><dt><TranslatedText>{"Blade / Finish"}</TranslatedText></dt><dd><TranslatedText>{product.blade}</TranslatedText></dd></div>}<div><dt><TranslatedText>{"Size / Spec"}</TranslatedText></dt><dd><TranslatedText>{product.size || "To be confirmed"}</TranslatedText></dd></div><div><dt><TranslatedText>{"MOQ"}</TranslatedText></dt><dd><TranslatedText>{product.moq}</TranslatedText></dd></div>{product.packaging && <div><dt><TranslatedText>{"Packaging"}</TranslatedText></dt><dd><TranslatedText>{product.packaging}</TranslatedText></dd></div>}{product.certification && <div><dt><TranslatedText>{"Standard"}</TranslatedText></dt><dd><TranslatedText>{product.certification}</TranslatedText></dd></div>}<div><dt><TranslatedText>{"Lead time"}</TranslatedText></dt><dd><TranslatedText>{product.leadTime || "Confirm with quote"}</TranslatedText></dd></div><div><dt><TranslatedText>{"Applications"}</TranslatedText></dt><dd><TranslatedText>{product.applications || "Wholesale and retail programs"}</TranslatedText></dd></div>{extraSpecifications.map(([name, value]) => <div key={name}><dt><TranslatedText>{name}</TranslatedText></dt><dd><TranslatedText>{value}</TranslatedText></dd></div>)}</dl></section>
    <section className="feature-section"><div><span className="kicker"><TranslatedText>{"PRODUCT & ORDER OPTIONS"}</TranslatedText></span><h2><TranslatedText>{"Discuss your requirements."}</TranslatedText></h2><p><TranslatedText>{customizationCopy(product)}</TranslatedText></p></div><ul>{features.map(feature => <li key={feature}><Check /><TranslatedText>{feature}</TranslatedText></li>)}</ul></section>
    {related.length > 0 && <section className="related-products"><span className="kicker"><TranslatedText>{"RELATED PRODUCTS"}</TranslatedText></span><h2><TranslatedText>{"More products in this category."}</TranslatedText></h2><div>{related.map(item => <Link href={productPath(item)} key={item.id}><span style={productImageStyle(item)}/><b><TranslatedText field="name" translations={item.translations}>{item.name}</TranslatedText></b><small><TranslatedText>{item.category}</TranslatedText></small></Link>)}</div></section>}
    <section className="detail-cta"><h2><TranslatedText>{"Have a reference product or target price?"}</TranslatedText></h2><p><TranslatedText>{"Send the link, photo or specification and we will help identify a suitable production option."}</TranslatedText></p><Link className="primary" href={quoteUrl}><TranslatedText>{"Start your inquiry "}</TranslatedText><ArrowRight /></Link></section>
    <div className="mobile-contact-bar"><Link href={sampleUrl}><TranslatedText>{"Request Sample"}</TranslatedText></Link>{whatsapp && <a href={whatsapp}><MessageCircle /><TranslatedText>{" WhatsApp"}</TranslatedText></a>}</div>
  </main>;
}
export async function generateStaticParams() {
    return (await getPublicProducts()).map(product => ({ id: publicProductSlug(product) }));
}
