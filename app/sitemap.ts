import type { MetadataRoute } from "next";
import { getPublicProducts } from "@/lib/store";
import { categorySlug } from "@/lib/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "https://example.com";
  const products = await getPublicProducts();
  const categories = Array.from(new Set(products.map(product => product.category)));
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...categories.map(category => ({ url: `${base}/categories/${categorySlug(category)}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...products.map(product => ({ url: `${base}/products/${product.id}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
