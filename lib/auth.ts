import crypto from "node:crypto";
import { cookies } from "next/headers";
const secret = () => { const value=process.env.SESSION_SECRET;if(!value||value.length<32)throw new Error("SESSION_SECRET must be configured with at least 32 characters");return value; };
const sign = (value: string) => crypto.createHmac("sha256", secret()).update(value).digest("hex");
export function makeSession() { const expires = String(Date.now() + 1000 * 60 * 60 * 12); return `${expires}.${sign(expires)}`; }
export async function isAdmin() { const value = (await cookies()).get("fn_admin")?.value; if (!value) return false; const [expires, signature] = value.split("."); if (!expires || !signature || Date.now() > Number(expires)) return false; const expected = sign(expires); return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)); }
