import { NextResponse } from "next/server";
import { makeSession } from "@/lib/auth";
import { clientAddress, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const throttle = rateLimit(`login:${clientAddress(request)}`, 10, 15 * 60 * 1000);
  if (!throttle.allowed) return NextResponse.json({ error: "尝试次数过多，请稍后再试" }, { status: 429, headers: { "Retry-After": String(throttle.retryAfter) } });
  const { password } = await request.json();
  const configured = process.env.ADMIN_PASSWORD || "admin123";
  if (password !== configured) return NextResponse.json({ error: "密码错误" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("fn_admin", makeSession(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 43200, path: "/" });
  return response;
}
