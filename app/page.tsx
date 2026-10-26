import type { Metadata } from "next";
import { isGardenCatalog } from "@/lib/product-presentation";
import { getPublicProducts, getSettings } from "@/lib/store";
import Storefront from "./storefront";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [products, settings] = await Promise.all([getPublicProducts(), getSettings()]);
  const garden = isGardenCatalog(products);
  const title = garden ? "Wholesale SK5 Pruning Shears" : "Wholesale Cutting Tools";
  const description = garden ? "Explore SK5 garden pruning shears from Edgevora Tools. Request wholesale pricing, samples and packaging options for your market." : "Explore our current cutting tools and request wholesale pricing, samples and order details.";
  const image = settings.heroImages?.[0] || settings.heroImage || products.find(product => product.image && product.image !== "/scissors-catalog.png")?.image;
  return { title: { absolute: `${title} | ${settings.companyName}` }, description, alternates: { canonical: "/" }, openGraph: { title: `${title} | ${settings.companyName}`, description, images: image ? [image] : [] }, twitter: { card: "summary_large_image", title: `${title} | ${settings.companyName}`, description, images: image ? [image] : [] } };
}

export default async function Home() {
  return <Storefront initialProducts={await getPublicProducts()} settings={await getSettings()} />;
}
