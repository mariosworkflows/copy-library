import { NextResponse } from "next/server";
import type { CampaignCategory, CopyCampaign, CopyClient, CopyStep } from "@/lib/copy-types";

export type { CampaignCategory, CopyCampaign, CopyClient, CopyStep };

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

type ClassifyInput = { id: string; name: string; subject: string; body: string };
type ClassifyResult = { category: CampaignCategory; subcategory?: string };

async function classifyCampaigns(
  campaigns: ClassifyInput[]
): Promise<Map<string, ClassifyResult>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || campaigns.length === 0) return new Map();

  const CHUNK_SIZE = 80;
  const resultMap = new Map<string, ClassifyResult>();

  for (let i = 0; i < campaigns.length; i += CHUNK_SIZE) {
    const chunk = campaigns.slice(i, i + CHUNK_SIZE);

    const prompt = `You are an expert at classifying B2B outbound sales campaigns by their strategic intent. Be precise — the category must reflect what actually triggered or shaped the campaign, not just the tone.

CATEGORIES:

1. cold — Pure ICP (Ideal Customer Profile) outreach with no specific trigger or buying signal. Targets companies based on fit only (industry, size, tech stack). No event or behavior drove the outreach.

2. signal — Triggered by a specific buying signal or behavioral event. The copy references or implies the trigger. Choose one subcategory:
   - funding: Company recently raised a funding round (seed, Series A/B/C, etc.)
   - new_hire: A specific person recently joined the company (new VP, CRO, CMO, etc.)
   - job_opening: Company is actively hiring for specific roles, signaling a need
   - customer_alumni: Targeting people who previously worked at a company that used a specific product/service, now at a new company
   - linkedin_engagement: Person recently liked, commented, followed, or engaged on LinkedIn
   - competitor_followers: Person follows a competitor LinkedIn page or uses a competitor product
   - website_visitor: Person visited a website (detected via RB2B, Warmly, intent data, etc.)

3. micro — Small, targeted invite campaigns. Choose one subcategory:
   - webinar: Inviting to a webinar, online workshop, or virtual session
   - event_invite: Inviting to an in-person event, conference, dinner, or meetup

CLASSIFICATION RULES:
- Read campaign name, subject line, and email body together — all three matter
- Name keywords: "funding/funded/raise/raised" → funding; "new hire/new VP/joined" → new_hire; "hiring/job opening/headcount" → job_opening; "alumni" → customer_alumni; "linkedin/engagement/follower" → linkedin/competitor; "visitor/rb2b/warmly/website" → website_visitor; "webinar/workshop" → webinar; "event/dinner/conference/summit/invite" → event_invite
- When body says "saw you raised", "congrats on the funding" → funding signal
- When body says "noticed you're hiring", "saw the job posting" → job_opening signal
- When body says "saw your post on LinkedIn" or "you liked our post" → linkedin_engagement
- When in doubt between cold and signal: if ANY trigger is referenced in the copy, classify as signal
- Customer alumni: look for "before joining", "at your previous company", "used [product] at [OldCo]"
- Only use cold if there is genuinely no signal or event referenced anywhere

Campaigns:
${JSON.stringify(chunk.map(c => ({ id: c.id, name: c.name, subject: c.subject, body: c.body.slice(0, 350) })), null, 2)}

Return ONLY a JSON array, no markdown, no explanation:
[{"id":"...","category":"cold|signal|micro","subcategory":"subcategory_value or null for cold"}]`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 4096,
          temperature: 0,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const text: string = data.choices?.[0]?.message?.content ?? "[]";
      const classifications = JSON.parse(text.trim());
      for (const c of classifications) {
        resultMap.set(c.id, {
          category: (c.category ?? "cold") as CampaignCategory,
          subcategory: c.subcategory ?? undefined,
        });
      }
    } catch {
      // silently skip — campaigns will default to "cold"
    }
  }

  return resultMap;
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
    const rawClients = await Promise.allSettled(
      entries.map(async ([clientId, { name, apiKey }]) => {
        const data = await instantlyGet(apiKey, "campaigns", { limit: "100" });
        if (!data) return null;

        const campaigns: Omit<CopyCampaign, "category" | "subcategory">[] = [];
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

        return { id: clientId, name, campaigns };
      })
    );

    // Collect all campaigns for batch classification
    const allForClassify: ClassifyInput[] = [];
    for (const result of rawClients) {
      if (result.status !== "fulfilled" || !result.value) continue;
      for (const c of result.value.campaigns) {
        const firstStep = c.steps[0];
        allForClassify.push({
          id: c.id,
          name: c.name,
          subject: firstStep?.subject ?? "",
          body: firstStep?.body ?? "",
        });
      }
    }

    const classifications = await classifyCampaigns(allForClassify);

    const clients: CopyClient[] = rawClients
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((c): c is NonNullable<typeof c> => c !== null && c.campaigns.length > 0)
      .map(({ id, name, campaigns }) => ({
        id,
        name,
        campaigns: campaigns
          .map((c) => {
            const cls = classifications.get(c.id);
            return {
              ...c,
              category: (cls?.category ?? "cold") as CampaignCategory,
              subcategory: cls?.subcategory,
            };
          })
          .sort((a, b) => b.positiveReplies - a.positiveReplies),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(clients);
  } catch (err) {
    console.error("[copy-library]", err);
    return NextResponse.json({ error: "Failed to load copy library" }, { status: 500 });
  }
}
