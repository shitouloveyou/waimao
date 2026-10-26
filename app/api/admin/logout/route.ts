import { secureEndpoint } from "@/lib/request-security";
import { NextResponse } from "next/server";

async function handlePOST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("fn_admin", "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 0, path: "/" });
  return response;
}

export const POST = secureEndpoint(handlePOST, true);
