import { NextResponse } from "next/server";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

const INSTANTLY_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Origin": "https://app.instantly.ai",
  "Referer": "https://app.instantly.ai/",
};

async function airtableGet(tableId: string, params: Record<string, string | string[]>) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      v.forEach((val) => url.searchParams.append(k, val));
    } else {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    next: { revalidate: 300 },
  });
  return res.json();
}

async function instantlyGet(apiKey: string, path: string, params?: Record<string, string>) {
  const url = new URL(`https://api.instantly.ai/api/v2/${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { ...INSTANTLY_HEADERS, Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

function stripHtml(html: string): string {
  return html
    .replace(/<div>/gi, "\n")
    .replace(/<\/div>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface CopyStep {
  id: string;
  label: string;
  subject?: string;
  body: string;
  channel: "email" | "linkedin";
}

export interface CopyCampaign {
  id: string;
  name: string;
  client: string;
  clientDomain?: string;
  channel: "Email" | "LinkedIn";
  positiveReplies: number;
  positiveReplyRate: number | null;
  steps: CopyStep[];
}

export interface CopyClient {
  id: string;
  name: string;
  domain?: string;
  campaigns: CopyCampaign[];
}

export async function GET() {
  try {
    const inboxData = await airtableGet("tblAoAKC7h3y4cl7y", {
      maxRecords: "200",
      "fields[]": ["Client Name", "Client", "Instantly API Key"],
    });

    const clientKeyMap = new Map<string, { name: string; apiKey: string }>();
    for (const rec of inboxData.records ?? []) {
      const f = rec.fields;
      const key = f["Instantly API Key"];
      const name = f["Client Name"];
      const clientIds: string[] = f["Client"] ?? [];
      if (key && name) {
        for (const cid of clientIds) {
          if (!clientKeyMap.has(cid)) {
            clientKeyMap.set(cid, { name, apiKey: key });
          }
        }
      }
    }

    const masterData = await airtableGet("tblL3OZRdGUKjTKOP", {
      maxRecords: "500",
      "fields[]": ["Campaign Name", "Positive Replies", "Sent (All Time)"],
    });

    const perfMap = new Map<string, { positiveReplies: number; positiveReplyRate: number | null }>();
    for (const rec of masterData.records ?? []) {
      const f = rec.fields;
      const name: string = f["Campaign Name"] ?? "";
      const pos: number = f["Positive Replies"] ?? 0;
      const sent: number = f["Sent (All Time)"] ?? 0;
      perfMap.set(name.trim(), {
        positiveReplies: pos,
        positiveReplyRate: sent > 0 ? Math.round((pos / sent) * 1000) / 10 : null,
      });
    }

    const entries = Array.from(clientKeyMap.entries());
    const clientResults = await Promise.allSettled(
      entries.map(async ([clientId, { name, apiKey }]) => {
        const data = await instantlyGet(apiKey, "campaigns", { limit: "100" });
        if (!data) return null;

        const campaigns: CopyCampaign[] = [];
        for (const c of data.items ?? []) {
          const steps: CopyStep[] = [];
          const seqs: { steps: { type: string; variants: { subject: string; body: string }[] }[] }[] =
            c.sequences ?? [];

          let stepIndex = 0;
          for (const seq of seqs) {
            for (const step of seq.steps ?? []) {
              const variant = step.variants?.[0];
              if (!variant) continue;
              const isLinkedIn = step.type === "linkedin" || step.type === "linkedin_message";
              steps.push({
                id: `${c.id}-step-${stepIndex}`,
                label: `Step ${stepIndex + 1}`,
                subject: variant.subject || undefined,
                body: stripHtml(variant.body ?? ""),
                channel: isLinkedIn ? "linkedin" : "email",
              });
              stepIndex++;
            }
          }

          if (steps.length === 0) continue;

          const perf = perfMap.get(c.name?.trim()) ?? { positiveReplies: 0, positiveReplyRate: null };
          const hasLinkedIn = steps.some((s) => s.channel === "linkedin");
          campaigns.push({
            id: c.id,
            name: c.name ?? "Untitled",
            client: name,
            channel: hasLinkedIn ? "LinkedIn" : "Email",
            positiveReplies: perf.positiveReplies,
            positiveReplyRate: perf.positiveReplyRate,
            steps,
          });
        }

        campaigns.sort((a, b) => b.positiveReplies - a.positiveReplies);
        return { id: clientId, name, campaigns } satisfies CopyClient;
      })
    );

    const clients: CopyClient[] = clientResults
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((c): c is CopyClient => c !== null && c.campaigns.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(clients);
  } catch (err) {
    console.error("[copy-library]", err);
    return NextResponse.json({ error: "Failed to load copy library" }, { status: 500 });
  }
}
