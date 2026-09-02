import { promises as fs } from "node:fs";
import path from "node:path";
import type { Inquiry, Product, SiteSettings } from "./types";

const defaults: Product[] = [
  { id: "hex-bolts", name: "High-Tensile Hex Bolts", category: "Fasteners", material: "Carbon Steel · Grade 8.8/10.9", price: "$0.18–0.86 / pc", moq: "1,000 pcs", status: "In Stock", description: "DIN and ANSI sizes with zinc, black oxide and hot-dip galvanized finishes.", image: "/product-hex-bolts.jpg" },
  { id: "stainless-screws", name: "Stainless Steel Screws", category: "Fasteners", material: "304 / 316 Stainless Steel", price: "$0.06–0.42 / pc", moq: "2,000 pcs", status: "In Stock", description: "Corrosion-resistant machine and self-tapping screws for demanding environments.", image: "/product-screws.jpg" },
  { id: "brackets", name: "Precision Metal Brackets", category: "Fabricated Parts", material: "Steel / Aluminum", price: "Request quote", moq: "500 pcs", status: "Made to Order", description: "Laser-cut, bent and finished to drawing with inspection reports available.", image: "/product-brackets.jpg" },
  { id: "anchors", name: "Heavy-Duty Anchors", category: "Construction Hardware", material: "Zinc-Plated Steel", price: "$0.32–2.60 / pc", moq: "500 pcs", status: "In Stock", description: "Mechanical anchors for concrete and masonry applications.", image: "/product-anchors.jpg" },
  { id: "fittings", name: "Threaded Pipe Fittings", category: "Industrial Fittings", material: "Stainless / Carbon Steel", price: "Request quote", moq: "200 pcs", status: "Request Quote", description: "NPT and BSP threaded fittings for industrial fluid systems.", image: "/product-fittings.jpg" },
  { id: "custom", name: "Custom CNC Components", category: "OEM & Custom", material: "To specification", price: "Request quote", moq: "100 pcs", status: "Made to Order", description: "Prototype-to-production machining based on your drawing or sample.", image: "/product-cnc.jpg" },
];
const defaultSettings: SiteSettings = { companyName: "ForgeNova Hardware", email: "sales@example.com", whatsapp: "Number to be added", wechat: "ID to be added", about: "We help overseas buyers source dependable hardware from China without the usual communication gaps. One point of contact, clear documentation and practical support from inquiry to delivery." };
type Data = { products: Product[]; inquiries: Inquiry[]; settings: SiteSettings };
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "store.json");
async function read(): Promise<Data> { try { const data = JSON.parse(await fs.readFile(dataFile, "utf8")); const products = (data.products || defaults).map((product:Product) => ({ ...product, image: product.image || defaults.find(item => item.id === product.id)?.image })); return { products, inquiries: data.inquiries || [], settings: data.settings || defaultSettings }; } catch { const initial = { products: defaults, inquiries: [], settings: defaultSettings }; await fs.mkdir(dataDir, { recursive: true }); await fs.writeFile(dataFile, JSON.stringify(initial, null, 2)); return initial; } }
async function write(data: Data) { await fs.mkdir(dataDir, { recursive: true }); const temp = `${dataFile}.tmp`; await fs.writeFile(temp, JSON.stringify(data, null, 2)); await fs.rename(temp, dataFile); }
export async function getProducts() { return (await read()).products; }
export async function getInquiries() { return (await read()).inquiries; }
export async function getSettings() { return (await read()).settings; }
export async function saveProducts(products: Product[]) { const data = await read(); data.products = products; await write(data); }
export async function saveSettings(settings: SiteSettings) { const data = await read(); data.settings = settings; await write(data); }
export async function addInquiry(inquiry: Inquiry) { const data = await read(); data.inquiries.unshift(inquiry); await write(data); }
