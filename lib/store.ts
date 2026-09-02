import { promises as fs } from "node:fs";
import path from "node:path";
import type { Inquiry, Product } from "./types";

const defaults: Product[] = [
  { id: "hex-bolts", name: "High-Tensile Hex Bolts", category: "Fasteners", material: "Carbon Steel · Grade 8.8/10.9", price: "$0.18–0.86 / pc", moq: "1,000 pcs", status: "In Stock", description: "DIN and ANSI sizes with zinc, black oxide and hot-dip galvanized finishes." },
  { id: "stainless-screws", name: "Stainless Steel Screws", category: "Fasteners", material: "304 / 316 Stainless Steel", price: "$0.06–0.42 / pc", moq: "2,000 pcs", status: "In Stock", description: "Corrosion-resistant machine and self-tapping screws for demanding environments." },
  { id: "brackets", name: "Precision Metal Brackets", category: "Fabricated Parts", material: "Steel / Aluminum", price: "Request quote", moq: "500 pcs", status: "Made to Order", description: "Laser-cut, bent and finished to drawing with inspection reports available." },
  { id: "anchors", name: "Heavy-Duty Anchors", category: "Construction Hardware", material: "Zinc-Plated Steel", price: "$0.32–2.60 / pc", moq: "500 pcs", status: "In Stock", description: "Mechanical anchors for concrete and masonry applications." },
  { id: "fittings", name: "Threaded Pipe Fittings", category: "Industrial Fittings", material: "Stainless / Carbon Steel", price: "Request quote", moq: "200 pcs", status: "Request Quote", description: "NPT and BSP threaded fittings for industrial fluid systems." },
  { id: "custom", name: "Custom CNC Components", category: "OEM & Custom", material: "To specification", price: "Request quote", moq: "100 pcs", status: "Made to Order", description: "Prototype-to-production machining based on your drawing or sample." },
];
type Data = { products: Product[]; inquiries: Inquiry[] };
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "store.json");
async function read(): Promise<Data> { try { return JSON.parse(await fs.readFile(dataFile, "utf8")); } catch { const initial = { products: defaults, inquiries: [] }; await fs.mkdir(dataDir, { recursive: true }); await fs.writeFile(dataFile, JSON.stringify(initial, null, 2)); return initial; } }
async function write(data: Data) { await fs.mkdir(dataDir, { recursive: true }); const temp = `${dataFile}.tmp`; await fs.writeFile(temp, JSON.stringify(data, null, 2)); await fs.rename(temp, dataFile); }
export async function getProducts() { return (await read()).products; }
export async function getInquiries() { return (await read()).inquiries; }
export async function saveProducts(products: Product[]) { const data = await read(); data.products = products; await write(data); }
export async function addInquiry(inquiry: Inquiry) { const data = await read(); data.inquiries.unshift(inquiry); await write(data); }
