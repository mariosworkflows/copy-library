import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const USERS_TABLE = "tblBiH6GFPPrMWP4m";

async function fetchUser(email: string) {
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

// PATCH /api/account/password
// Body: { currentPassword, newPassword }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { currentPassword?: string; newPassword?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Both fields are required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  const record = await fetchUser(session.user.email);
  if (!record) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const hash: string = record.fields.PasswordHash ?? "";
  const valid = await bcrypt.compare(currentPassword, hash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  const newHash = await bcrypt.hash(newPassword, 12);

  const patchRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}/${record.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { PasswordHash: newHash } }),
  });

  if (!patchRes.ok) return NextResponse.json({ error: "Failed to update password" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
