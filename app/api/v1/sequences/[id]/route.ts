import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const SEQUENCES_TABLE = process.env.SEQUENCES_TABLE_ID!;

function airtableHeaders() {
  return { Authorization: `Bearer ${AIRTABLE_TOKEN}` };
}

/**
 * GET /api/v1/sequences/:id
 *
 * Returns a single sequence by its Airtable record ID.
 * The sequence must belong to the API key holder.
 *
 * Authentication: Bearer token in Authorization header
 *   Authorization: Bearer wf_<your-api-key>
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get("authorization") ?? "";
  const key = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  const user = await validateApiKey(key);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Pass your key as: Authorization: Bearer wf_<key>" },
      { status: 401 }
    );
  }

  const { id } = params;
  if (!id) return NextResponse.json({ error: "Missing sequence id" }, { status: 400 });

  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SEQUENCES_TABLE}/${id}`,
    { headers: airtableHeaders(), cache: "no-store" }
  );

  if (res.status === 404) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch sequence" }, { status: 502 });

  const record = await res.json();

  // Ensure the sequence belongs to the API key owner
  if ((record.fields.UserEmail as string)?.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: record.id,
    title: record.fields.Title ?? "Untitled",
    client: record.fields.Client ?? "",
    category: record.fields.Category ?? "cold",
    steps: JSON.parse((record.fields.Steps as string) ?? "[]"),
    createdAt: record.fields.CreatedAt ?? "",
    updatedAt: record.fields.UpdatedAt ?? "",
    status: record.fields.Status ?? "draft",
  });
}
