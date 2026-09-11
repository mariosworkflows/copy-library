import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const SEQUENCES_TABLE = process.env.SEQUENCES_TABLE_ID!;
const COPY_LIBRARY_API_KEY = process.env.COPY_LIBRARY_API_KEY!;

export async function GET(req: NextRequest) {
  // API key auth
  const auth = req.headers.get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!key || key !== COPY_LIBRARY_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  const category = searchParams.get("category");
  const user = searchParams.get("user");

  const filters: string[] = [];
  if (client) filters.push(`FIND(LOWER("${client.toLowerCase()}"), LOWER({Client}))`);
  if (category) filters.push(`{Category}="${category}"`);
  if (user) filters.push(`{UserEmail}="${user}"`);

  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SEQUENCES_TABLE}`);
  url.searchParams.set("sort[0][field]", "CreatedAt");
  url.searchParams.set("sort[0][direction]", "desc");
  if (filters.length > 0) {
    url.searchParams.set("filterByFormula", filters.length === 1 ? filters[0] : `AND(${filters.join(",")})`);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();

  const sequences = (data.records ?? []).map((r: { id: string; fields: Record<string, unknown> }) => ({
    id: r.id,
    title: r.fields.Title ?? "Untitled",
    client: r.fields.Client ?? "",
    category: r.fields.Category ?? "",
    steps: (() => {
      try { return JSON.parse(r.fields.Steps as string ?? "[]"); }
      catch { return []; }
    })(),
    savedBy: r.fields.UserEmail ?? "",
    savedByName: r.fields.UserName ?? "",
    createdAt: r.fields.CreatedAt ?? "",
    updatedAt: r.fields.UpdatedAt ?? "",
    status: r.fields.Status ?? "draft",
  }));

  return NextResponse.json({
    sequences,
    count: sequences.length,
    filters: { client, category, user },
  });
}
