import { NextResponse } from "next/server";
import { makeSession } from "@/lib/auth";
export async function POST(request: Request) { const { password } = await request.json(); const configured = process.env.ADMIN_PASSWORD || "admin123"; if (password !== configured) return NextResponse.json({ error: "密码错误" }, { status: 401 }); const res = NextResponse.json({ ok: true }); res.cookies.set("fn_admin", makeSession(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 43200, path: "/" }); return res; }
