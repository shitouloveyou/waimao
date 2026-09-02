import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { saveProducts } from "@/lib/store";
export async function PUT(request: Request) { if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const products = await request.json(); if (!Array.isArray(products)) return NextResponse.json({ error: "Invalid products" }, { status: 400 }); await saveProducts(products); return NextResponse.json({ ok: true }); }
