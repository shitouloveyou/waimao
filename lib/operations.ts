import { promises as fs } from "node:fs";
import path from "node:path";

export type EventRecord = { type: "view" | "product_click" | "whatsapp" | "inquiry"; page: string; visitor: string; source: string; campaign: string; createdAt: string };
const directory = process.env.DATA_DIR || path.join(process.cwd(), "data");
const filename = path.join(directory, "events.jsonl");
export async function recordEvent(event: EventRecord) {
  await fs.mkdir(directory, { recursive: true });
  await fs.appendFile(filename, JSON.stringify(event) + "\n");
}
export async function getEvents(): Promise<EventRecord[]> {
  try { return (await fs.readFile(filename, "utf8")).split("\n").filter(Boolean).flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}
