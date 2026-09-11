import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const USERS_TABLE = "tblBiH6GFPPrMWP4m";
const ALLOWED_DOMAIN = "workflows.io";

async function findUserByEmail(email: string) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}`);
  url.searchParams.set("filterByFormula", `{Email}="${email}"`);
  url.searchParams.set("maxRecords", "1");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return data.records?.[0] ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split("@")[1];
    if (domain !== ALLOWED_DOMAIN) {
      return NextResponse.json(
        { error: "Registration is restricted to @workflows.io email addresses." },
        { status: 403 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 12);
    await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Name: name.trim(),
              Email: normalizedEmail,
              PasswordHash: hash,
              CreatedAt: new Date().toISOString(),
            },
          },
        ],
      }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
