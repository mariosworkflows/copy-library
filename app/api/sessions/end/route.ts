import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const SESSIONS_TABLE = process.env.SESSIONS_TABLE_ID!;

// POST — dedicated end-session endpoint used by sendBeacon (which only supports POST)
// No session auth: sendBeacon doesn't reliably send cookies; security is
// ensured by requiring a recordId that only the client who started the session holds.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { recordId, durationSeconds } = body;

  if (!recordId) return NextResponse.json({ error: "recordId required" }, { status: 400 });

  await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SESSIONS_TABLE}/${recordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          EndTime: new Date().toISOString(),
          DurationSeconds: typeof durationSeconds === "number" ? durationSeconds : 0,
          Status: "ended",
        },
      }),
      cache: "no-store",
    }
  );

  return NextResponse.json({ ok: true });
}
