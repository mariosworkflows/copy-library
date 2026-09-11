import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const USERS_TABLE = "tblBiH6GFPPrMWP4m";
const SESSIONS_TABLE = process.env.SESSIONS_TABLE_ID!;

async function fetchAll(tableId: string, fields: string[]) {
  const records: Array<{ id: string; fields: Record<string, unknown> }> = [];
  let offset: string | undefined;
  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);
    fields.forEach((f) => url.searchParams.append("fields[]", f));
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      cache: "no-store",
    });
    const data = await res.json();
    records.push(...(data.records ?? []));
    offset = data.offset;
  } while (offset);
  return records;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [userRecords, sessionRecords] = await Promise.all([
    fetchAll(USERS_TABLE, ["Name", "Email", "Role", "CreatedAt"]),
    fetchAll(SESSIONS_TABLE, ["UserEmail", "UserName", "StartTime", "EndTime", "DurationSeconds", "Status", "PagePath", "PageName"]),
  ]);

  type PageSession = {
    startTime: string;
    endTime: string | null;
    durationSeconds: number;
    status: string;
    pagePath: string;
    pageName: string;
  };

  type PageStat = { pagePath: string; pageName: string; totalSeconds: number; visits: number };

  const sessionsByEmail: Record<string, PageSession[]> = {};
  for (const rec of sessionRecords) {
    const f = rec.fields;
    const email = (f.UserEmail as string) ?? "";
    if (!sessionsByEmail[email]) sessionsByEmail[email] = [];
    sessionsByEmail[email].push({
      startTime:       (f.StartTime as string) ?? "",
      endTime:         (f.EndTime as string) ?? null,
      durationSeconds: (f.DurationSeconds as number) ?? 0,
      status:          (f.Status as string) ?? "ended",
      pagePath:        (f.PagePath as string) ?? "/",
      pageName:        (f.PageName as string) ?? "Unknown",
    });
  }

  const users = userRecords.map((rec) => {
    const f = rec.fields;
    const email = (f.Email as string) ?? "";
    const sessions = (sessionsByEmail[email] ?? []).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    // Build per-page stats
    const pageMap: Record<string, PageStat> = {};
    for (const s of sessions) {
      if (!pageMap[s.pagePath]) {
        pageMap[s.pagePath] = { pagePath: s.pagePath, pageName: s.pageName, totalSeconds: 0, visits: 0 };
      }
      pageMap[s.pagePath].totalSeconds += s.durationSeconds;
      pageMap[s.pagePath].visits += 1;
    }
    const pageStats = Object.values(pageMap).sort((a, b) => b.totalSeconds - a.totalSeconds);

    const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    return {
      id: rec.id,
      name:             (f.Name as string) ?? "",
      email,
      role:             (f.Role as string) ?? "user",
      createdAt:        (f.CreatedAt as string) ?? "",
      sessions,
      pageStats,
      totalSessions:    sessions.length,
      totalTimeSeconds: totalSeconds,
      lastSeen:         sessions[0]?.startTime ?? null,
    };
  });

  return NextResponse.json({ users });
}
