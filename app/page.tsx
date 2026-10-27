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
  const image = /^\/api\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/i.test(settings.homeShareImage || "") ? settings.homeShareImage! : "/share/home";
  return { title: { absolute: `${title} | ${settings.companyName}` }, description, alternates: { canonical: "/" }, openGraph: { title: `${title} | ${settings.companyName}`, description, images: [{ url: image, alt: `${settings.companyName} — tools and hardware` }] }, twitter: { card: "summary_large_image", title: `${title} | ${settings.companyName}`, description, images: [{ url: image, alt: `${settings.companyName} — tools and hardware` }] } };
}

export default async function Home() {
  return <Storefront initialProducts={await getPublicProducts()} settings={await getSettings()} />;
}
