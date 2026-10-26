import { NextResponse } from "next/server";

export class RequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function sameOrigin(request: Request): boolean {
  try {
    const origin = request.headers.get("origin");
    const expected = new URL(process.env.SITE_URL || request.url).origin;
    return Boolean(origin && new URL(origin).origin === expected && request.headers.get("sec-fetch-site") !== "cross-site");
  } catch { return false; }
}
export function secureEndpoint<T extends unknown[]>(handler: (request: Request, ...args: T) => Promise<Response>, mutating = true) {
  return async (request: Request, ...args: T): Promise<Response> => {
    try {
      if (mutating && !sameOrigin(request)) throw new RequestError(403, "Forbidden request origin");
      const response = await handler(request, ...args);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    } catch (error) {
      if (error instanceof RequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "private, no-store" } });
      console.error("API request failed", error instanceof Error ? error.name : "Unknown error");
      return NextResponse.json({ error: "Unable to process request. Please try again." }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
    }
  };
}
async function limitedBody(request: Request, maximum: number): Promise<Uint8Array> {
  const encoding = request.headers.get("content-encoding");
  if (encoding && encoding.toLowerCase() !== "identity") throw new RequestError(415, "Compressed request bodies are not supported");
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maximum)) throw new RequestError(413, "Request is too large");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); throw new RequestError(413, "Request is too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}
export async function readJson(request: Request, maximum = 64 * 1024) {
  if (!/^application\/json(?:;|$)/i.test(request.headers.get("content-type") || "")) throw new RequestError(415, "JSON content type required");
  const body = await limitedBody(request, maximum);
  try {
    const value = JSON.parse(new TextDecoder().decode(body));
    if (!value || typeof value !== "object") throw new Error("Invalid shape");
    return value;
  } catch { throw new RequestError(400, "Invalid JSON request"); }
}
export async function readForm(request: Request, maximum: number) {
  const type = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data;/i.test(type)) throw new RequestError(415, "Form data required");
  const body = await limitedBody(request, maximum);
  try { return await new Request(request.url, { method: "POST", headers: { "Content-Type": type }, body: new Blob([body as Uint8Array<ArrayBuffer>]) }).formData(); }
  catch { throw new RequestError(400, "Invalid form data"); }
}
