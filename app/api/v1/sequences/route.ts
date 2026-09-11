import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const SEQUENCES_TABLE = process.env.SEQUENCES_TABLE_ID!;

function airtableHeaders() {
  return { Authorization: `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" };
}

/**
 * GET /api/v1/sequences
 *
 * Returns all sequences owned by the API key holder.
 *
 * Authentication: Bearer token in Authorization header
 *   Authorization: Bearer wf_<your-api-key>
 *
 * Response:
 *   { sequences: [ { id, title, client, category, steps, createdAt, updatedAt, status } ] }
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const key = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  const user = await validateApiKey(key);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Pass your key as: Authorization: Bearer wf_<key>" },
      { status: 401 }
    );
  }

  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SEQUENCES_TABLE}`);
  url.searchParams.set("filterByFormula", `{UserEmail}="${user.email}"`);
  url.searchParams.set("sort[0][field]", "CreatedAt");
  url.searchParams.set("sort[0][direction]", "desc");

  const res = await fetch(url.toString(), { headers: airtableHeaders(), cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch sequences" }, { status: 502 });
  }

  const data = await res.json();
  const sequences = (data.records ?? []).map((r: { id: string; fields: Record<string, unknown> }) => ({
    id: r.id,
    title: r.fields.Title ?? "Untitled",
    client: r.fields.Client ?? "",
    category: r.fields.Category ?? "cold",
    steps: JSON.parse((r.fields.Steps as string) ?? "[]"),
    createdAt: r.fields.CreatedAt ?? "",
    updatedAt: r.fields.UpdatedAt ?? "",
    status: r.fields.Status ?? "draft",
  }));

  return NextResponse.json({ sequences });
}
