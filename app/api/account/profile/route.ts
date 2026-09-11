import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const USERS_TABLE = "tblBiH6GFPPrMWP4m";

async function fetchUserRecord(email: string) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}`);
  url.searchParams.set("filterByFormula", `{Email}="${email.toLowerCase()}"`);
  url.searchParams.set("maxRecords", "1");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return data.records?.[0] ?? null;
}

// PATCH /api/account/profile
// Body: { name }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { name } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const record = await fetchUserRecord(session.user.email);
  if (!record) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const patchRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}/${record.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { Name: name.trim() } }),
  });

  if (!patchRes.ok) return NextResponse.json({ error: "Failed to update profile" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
