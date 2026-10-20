import { NextResponse } from "next/server";
import { makeSession } from "@/lib/auth";
import { clientAddress, rateLimit } from "@/lib/rate-limit";
import crypto from "node:crypto";

export async function POST(request: Request) {
  const throttle = rateLimit(`login:${clientAddress(request)}`, 5, 15 * 60 * 1000);
  if (!throttle.allowed) return NextResponse.json({ error: "尝试次数过多，请稍后再试" }, { status: 429, headers: { "Retry-After": String(throttle.retryAfter) } });
  const { password } = await request.json();
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return NextResponse.json({ error: "后台尚未安全配置" }, { status: 503 });
  const suppliedHash=crypto.createHash("sha256").update(String(password||"")).digest();
  const configuredHash=crypto.createHash("sha256").update(configured).digest();
  if (!crypto.timingSafeEqual(suppliedHash,configuredHash)) return NextResponse.json({ error: "密码错误" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("fn_admin", makeSession(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 43200, path: "/" });
  return response;
}
