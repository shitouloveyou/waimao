import { TranslatedText, TranslatedInput, TranslatedTextarea, TranslatedButton, TranslatedSelect } from "@/app/translation-context";
import { productPath, productImageStyle } from "@/lib/product-presentation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublicProducts, getSettings } from "@/lib/store";
import { categorySlug } from "@/lib/slug";
export const dynamic = "force-dynamic";
async function categoryFor(slug: string) {
    const products = await getPublicProducts();
    const category = products.find(product => categorySlug(product.category) === slug)?.category;
    return { category, products: products.filter(product => product.category === category) };
}
export async function generateMetadata({ params }: {
    params: Promise<{
        slug: string;
    }>;
}): Promise<Metadata> {
    const { category } = await categoryFor((await params).slug);
    if (!category)
        return {};
    return { title: `${category} Wholesale & OEM`, description: `Browse wholesale ${category.toLowerCase()} for distributors, retailers and private-label programs.`, alternates: { canonical: `/categories/${categorySlug(category)}` } };
}
export default async function CategoryPage({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) {
    const { category, products } = await categoryFor((await params).slug);
    if (!category)
        notFound();
    const settings = await getSettings();
    const base = process.env.SITE_URL || "https://edgevoratools.com";
    const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: base }, { "@type": "ListItem", position: 2, name: category, item: `${base}/categories/${categorySlug(category)}` }] };
    return <main className="category-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }}/><header className="detail-nav"><Link href="/#products"><ArrowLeft /><TranslatedText>{" All products"}</TranslatedText></Link><b><TranslatedText>{settings.companyName}</TranslatedText></b><Link className="detail-quote" href="/#quote"><TranslatedText>{"Request quote"}</TranslatedText></Link></header><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/"><TranslatedText>{"Home"}</TranslatedText></Link><span><TranslatedText>{"/"}</TranslatedText></span><b><TranslatedText>{category}</TranslatedText></b></nav><section className="category-hero"><span className="kicker"><TranslatedText>{"PRODUCT CATEGORY"}</TranslatedText></span><h1><TranslatedText>{category}</TranslatedText></h1><p><TranslatedText>{"Wholesale and OEM options for distributors, retailers and private-label brands."}</TranslatedText></p></section><section className="category-products products">{products.map(product => <article className="product" key={product.id}><Link href={productPath(product)} className="product-art" style={productImageStyle(product)}/><div className="product-body"><span className="product-category"><TranslatedText>{product.category}</TranslatedText></span><h3><Link href={productPath(product)}><TranslatedText field="name" translations={product.translations}>{product.name}</TranslatedText></Link></h3><p><TranslatedText field="description" translations={product.translations}>{product.description}</TranslatedText></p><dl><div><dt><TranslatedText>{"Material"}</TranslatedText></dt><dd><TranslatedText>{product.material}</TranslatedText></dd></div><div><dt><TranslatedText>{"MOQ"}</TranslatedText></dt><dd><TranslatedText>{product.moq}</TranslatedText></dd></div></dl><div className="product-foot"><b><TranslatedText>{product.price}</TranslatedText></b><Link href={productPath(product)}><TranslatedText>{"Details "}</TranslatedText><ArrowRight /></Link></div></div></article>)}</section></main>;
}
export async function generateStaticParams() {
    const products = await getPublicProducts();
    return Array.from(new Set(products.map(product => categorySlug(product.category)))).filter(Boolean).map(slug => ({ slug }));
}
