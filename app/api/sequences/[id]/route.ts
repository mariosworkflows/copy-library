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

// PATCH /api/sequences/[id] — update a sequence
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, client, category, steps, status, decisionMakers, angle } = await req.json();

  const fields: Record<string, unknown> = { UpdatedAt: new Date().toISOString() };
  if (title !== undefined) fields.Title = title;
  if (client !== undefined) fields.Client = client;
  if (category !== undefined) fields.Category = category;
  if (steps !== undefined) fields.Steps = JSON.stringify(steps);
  if (status !== undefined) fields.Status = status;
  if (decisionMakers !== undefined) fields.DecisionMakers = decisionMakers;
  if (angle !== undefined) fields.Angle = angle;

  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SEQUENCES_TABLE}/${params.id}`, {
    method: "PATCH",
    headers: airtableHeaders(),
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/sequences/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SEQUENCES_TABLE}/${params.id}`, {
    method: "DELETE",
    headers: airtableHeaders(),
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  return NextResponse.json({ success: true });
}
