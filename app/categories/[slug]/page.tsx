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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { category } = await categoryFor((await params).slug);
  if (!category) return {};
  return { title: `${category} Wholesale & OEM`, description: `Browse wholesale ${category.toLowerCase()} for distributors, retailers and private-label programs.`, alternates: { canonical: `/categories/${categorySlug(category)}` } };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { category, products } = await categoryFor((await params).slug);
  if (!category) notFound();
  const settings = await getSettings();
  return <main className="category-page"><header className="detail-nav"><Link href="/#products"><ArrowLeft /> All products</Link><b>{settings.companyName}</b><Link className="detail-quote" href="/#quote">Request quote</Link></header><section className="category-hero"><span className="kicker">PRODUCT CATEGORY</span><h1>{category}</h1><p>Wholesale and OEM options for distributors, retailers and private-label brands.</p></section><section className="category-products products">{products.map(product=><article className="product" key={product.id}><Link href={`/products/${product.id}`} className="product-art" style={product.image?{backgroundImage:`url(${product.image})`,backgroundPosition:product.imagePosition||"center",backgroundSize:product.imagePosition?"300% 200%":"cover"}:undefined}/><div className="product-body"><span className="product-category">{product.category}</span><h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3><p>{product.description}</p><dl><div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>MOQ</dt><dd>{product.moq}</dd></div></dl><div className="product-foot"><b>{product.price}</b><Link href={`/products/${product.id}`}>Details <ArrowRight /></Link></div></div></article>)}</section></main>;
}

export async function generateStaticParams() {
  const products = await getPublicProducts();
  return Array.from(new Set(products.map(product => categorySlug(product.category)))).filter(Boolean).map(slug => ({ slug }));
}
