import type { Product } from "./types";

// Keep stored IDs stable for admin edits, saved products and existing inquiries.
const gardenSlugs: Record<string, string> = {
  "kitchen-shears": "sk5-pruning-shears-red-silver",
  "tailor-scissors": "sk5-pruning-shears-safety-lock",
  "electrician-scissors": "sk5-pruning-shears-gray-red",
};
export function publicProductSlug(product: Product): string {
  return product.category === "Garden Tools" ? gardenSlugs[product.id] || product.id : product.id;
}
export function productPath(product: Product): string {
  return `/products/${encodeURIComponent(publicProductSlug(product))}`;
}
export function isGardenCatalog(products: Product[]): boolean {
  return products.length > 0 && products.every(product => product.category === "Garden Tools");
}
export function productImageStyle(product: Product) {
  if (!product.image) return undefined;
  const sprite = product.image === "/scissors-catalog.png" && Boolean(product.imagePosition);
  return { backgroundImage: `url(${product.image})`, backgroundPosition: sprite ? product.imagePosition : "center", backgroundSize: sprite ? "300% 200%" : "contain", backgroundRepeat: "no-repeat" };
}
const legacyCustomization = new Set([
  "Blade finish, handle color, logo, packaging",
  "Handle color, blade coating, logo, blister pack",
  "Handle color, laser logo, pouch, tool kit packing",
]);
export function customizationCopy(product: Product): string {
  const copy = product.customization?.trim();
  if (!copy || copy === product.seoTitle || legacyCustomization.has(copy)) {
    return "Ask about logo and packaging options. Availability, minimum quantities and costs are confirmed for each model.";
  }
  return copy;
}
