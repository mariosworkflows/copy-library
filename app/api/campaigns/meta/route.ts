import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const MASTER_TABLE = "tblL3OZRdGUKjTKOP";

async function airtablePatch(tableId: string, recordId: string, fields: Record<string, string>) {
  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    }
  );
  return res;
}

async function airtableCreate(tableId: string, fields: Record<string, string>) {
  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    }
  );
  return res;
}

// PATCH /api/campaigns/meta
// Body: { masterRecordId?: string, campaignName: string, decisionMakers: string, angle: string }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { masterRecordId?: string; campaignName?: string; decisionMakers?: string; angle?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { masterRecordId, campaignName, decisionMakers = "", angle = "" } = body;

  if (!masterRecordId && !campaignName) {
    return NextResponse.json({ error: "masterRecordId or campaignName required" }, { status: 400 });
  }

  if (masterRecordId) {
    const res = await airtablePatch(MASTER_TABLE, masterRecordId, {
      "Decision Makers": decisionMakers,
      "Angle": angle,
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "Airtable error", detail: err }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json({ recordId: data.id });
  }

  // No existing record — create one
  const res = await airtableCreate(MASTER_TABLE, {
    "Campaign Name": campaignName!,
    "Decision Makers": decisionMakers,
    "Angle": angle,
  });
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: "Airtable error", detail: err }, { status: 502 });
  }
  const data = await res.json();
  return NextResponse.json({ recordId: data.id });
}
