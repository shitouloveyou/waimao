import { secureEndpoint, readJson } from "@/lib/request-security";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { saveProducts } from "@/lib/store";
function invalidTranslations(value: unknown) {
  if (value === undefined) return false;
  if (!value || typeof value !== "object" || Array.isArray(value)) return true;
  return Object.entries(value).some(([lang, fields]) => !["fr","de","es"].includes(lang) || !fields || typeof fields !== "object" || Array.isArray(fields) || Object.entries(fields).some(([key,text])=>!["name","description"].includes(key)||typeof text!=="string"||text.length>(key==="name"?200:10000)));
}
async function handlePUT(request: Request) { if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const products = await readJson(request, 1024 * 1024); if (!Array.isArray(products) || products.length > 500 || products.some(product => !product || typeof product !== "object" || invalidTranslations(product.translations) || typeof product.id !== "string" || !/^[a-z0-9][a-z0-9_-]{0,119}$/i.test(product.id) || ["name", "category", "material", "price", "moq", "description"].some(key => typeof product[key] !== "string") || Object.values(product).some(value => typeof value === "string" && value.length > 10000)) || new Set(products.map(product => product.id)).size !== products.length) return NextResponse.json({ error: "Invalid products" }, { status: 400 }); await saveProducts(products); return NextResponse.json({ ok: true }); }

export const PUT = secureEndpoint(handlePUT, true);
