import type { MetadataRoute } from "next";
import { getPublicProducts } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "https://example.com";
  const products = await getPublicProducts();
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...products.map(product => ({ url: `${base}/products/${product.id}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
