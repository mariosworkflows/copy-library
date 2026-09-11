import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const SESSIONS_TABLE = process.env.SESSIONS_TABLE_ID!;

async function airtablePost(body: object) {
  return fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SESSIONS_TABLE}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

async function airtablePatch(recordId: string, fields: object) {
  return fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SESSIONS_TABLE}/${recordId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
}

// POST — start a page session
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { sessionId, pagePath, pageName } = body;

  const res = await airtablePost({
    records: [{
      fields: {
        SessionId:  sessionId ?? crypto.randomUUID(),
        UserEmail:  session.user.email,
        UserName:   session.user.name ?? "",
        PagePath:   pagePath ?? "/",
        PageName:   pageName ?? "Unknown",
        StartTime:  new Date().toISOString(),
        Status:     "active",
      },
    }],
  });

  const data = await res.json();
  const recordId = data.records?.[0]?.id ?? null;
  return NextResponse.json({ recordId });
}

// PATCH — end a page session
export async function PATCH(req: NextRequest) {
  // sendBeacon doesn't send credentials, so we skip session check here
  // but validate recordId is present
  const body = await req.json().catch(() => ({}));
  const { recordId, durationSeconds } = body;
  if (!recordId) return NextResponse.json({ error: "recordId required" }, { status: 400 });

  await airtablePatch(recordId, {
    EndTime:         new Date().toISOString(),
    DurationSeconds: durationSeconds ?? 0,
    Status:          "ended",
  });

  return NextResponse.json({ ok: true });
}
