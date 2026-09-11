import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const SEQUENCES_TABLE = process.env.SEQUENCES_TABLE_ID!;

function airtableHeaders() {
  return { Authorization: `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" };
}

// GET /api/sequences — list current user's sequences
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  const isAdmin = role === "admin";
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true" && isAdmin;

  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SEQUENCES_TABLE}`);
  url.searchParams.set("sort[0][field]", "CreatedAt");
  url.searchParams.set("sort[0][direction]", "desc");
  if (!all) {
    url.searchParams.set("filterByFormula", `{UserEmail}="${session.user.email}"`);
  }

  const res = await fetch(url.toString(), { headers: airtableHeaders(), cache: "no-store" });
  const data = await res.json();

  const sequences = (data.records ?? []).map((r: { id: string; fields: Record<string, unknown> }) => ({
    id: r.id,
    title: r.fields.Title ?? "Untitled",
    client: r.fields.Client ?? "",
    category: r.fields.Category ?? "cold",
    steps: JSON.parse((r.fields.Steps as string) ?? "[]"),
    userEmail: r.fields.UserEmail ?? "",
    userName: r.fields.UserName ?? "",
    createdAt: r.fields.CreatedAt ?? "",
    updatedAt: r.fields.UpdatedAt ?? "",
    status: r.fields.Status ?? "draft",
    decisionMakers: r.fields.DecisionMakers ?? "",
    angle: r.fields.Angle ?? "",
  }));

  return NextResponse.json({ sequences });
}

// POST /api/sequences — create a new sequence
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, client, category, steps, decisionMakers, angle } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const now = new Date().toISOString();

  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SEQUENCES_TABLE}`, {
    method: "POST",
    headers: airtableHeaders(),
    body: JSON.stringify({
      records: [{
        fields: {
          Title: title.trim(),
          Client: client ?? "",
          Category: category ?? "cold",
          Steps: JSON.stringify(steps ?? []),
          DecisionMakers: decisionMakers ?? "",
          Angle: angle ?? "",
          UserEmail: session.user.email,
          UserName: session.user.name ?? "",
          CreatedAt: now,
          UpdatedAt: now,
          Status: "draft",
        },
      }],
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: "Failed to save sequence." }, { status: 500 });

  return NextResponse.json({ id: data.records?.[0]?.id, success: true });
}
