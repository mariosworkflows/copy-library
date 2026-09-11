import { NextResponse } from "next/server";
import type { CampaignCategory, CopyCampaign, CopyClient, CopyStep } from "@/lib/copy-types";
import { GDRIVE_LINKEDIN_CAMPAIGNS } from "@/lib/gdrive-linkedin";

export const dynamic = "force-dynamic";

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

// ── Account data (sourced from Notion Clients Database + Google Drive briefs) ──
const ACCOUNT_DATA: Record<string, { owner: string; manager: string; description: string }> = {
  "Alibaba": {
    owner: "Pari Tomar, Levi Bom, Daniel Martinez",
    manager: "Anabel Arndt, Dan Rosenthal",
    description: "Global B2B e-commerce marketplace connecting manufacturers and wholesalers with buyers worldwide. Alibaba.com's Elite Buyer Program helps high-volume US retailers source products directly from verified suppliers.",
  },
  "Blotout": {
    owner: "Elena Mahmutaj",
    manager: "Monika Kitanoska",
    description: "Server-side first-party data infrastructure platform for performance marketers. Replaces client-side tracking pixels with a privacy-compliant data layer that works without third-party cookies.",
  },
  "ExaCare": {
    owner: "Jan Brochwicz, Anabel Arndt",
    manager: "Monika Kitanoska",
    description: "AI-powered platform for senior care operators — hospice agencies and skilled nursing facilities. Automates clinical documentation, census management, and referral tracking to reduce admin burden on care teams.",
  },
  "FullEnrich": {
    owner: "Jack Katene",
    manager: "Monika Kitanoska",
    description: "Waterfall contact-data enrichment platform that aggregates 20+ data vendors (Apollo, Hunter, Dropcontact, and others) to find verified work emails and phone numbers at the highest hit rate available.",
  },
  "HeyReach": {
    owner: "Jack Katene",
    manager: "Lorenzo Amadei",
    description: "LinkedIn outreach automation platform built for agencies and sales teams. Enables multi-sender LinkedIn campaigns at scale — connection requests, messages, and follow-ups — without triggering LinkedIn limits.",
  },
  "Invoice Butler": {
    owner: "Uzayr",
    manager: "Marios Charalambous",
    description: "AI-powered accounts receivable automation tool for B2B companies. Handles collections, dispute resolution, and payment follow-ups — acting as an outsourced AR team to reduce overdue invoices and DSO.",
  },
  "Lexroom": {
    owner: "Lorenzo Amadei, Giovanni de Franciscis, Elena Mahmutaj",
    manager: "Lorenzo Amadei",
    description: "AI legal research and drafting platform built for Italian law firms. Helps attorneys find case law, draft briefs, and review contracts faster using AI trained on Italian legal databases.",
  },
  "Medrio": {
    owner: "Marios Charalambous, Martin Blanchard",
    manager: "Monika Kitanoska",
    description: "No-code electronic data capture (EDC) platform for clinical trials. Enables sponsors and CROs to build and deploy trial databases in days rather than months, cutting study setup time by over 60%.",
  },
  "Merchkit": {
    owner: "Elena Mahmutaj",
    manager: "Monika Kitanoska",
    description: "E-commerce product content and catalog management platform. Helps retailers and brands create, syndicate, and enrich product listings across marketplaces and sales channels from a single source of truth.",
  },
  "Momentic": {
    owner: "Jack Katene, Martin Blanchard",
    manager: "Lorenzo Amadei",
    description: "AI-powered end-to-end testing platform (YC W24). Lets engineering teams write and run UI tests 10–16x faster than Selenium, with self-healing tests that adapt automatically when the UI changes.",
  },
  "Mutiny": {
    owner: "Jack Katene, Mikhail Torbas",
    manager: "",
    description: "GTM personalization and ABM platform that helps B2B companies tailor their website, messaging, and outreach by account segment — enabling sales and marketing teams to run targeted campaigns without engineering.",
  },
};

type ClassifyResult = { category: CampaignCategory; subcategory?: string };

function classifyCampaign(name: string, subject: string, body: string): ClassifyResult {
  const n = name.toLowerCase();
  const s = subject.toLowerCase();
  const b = body.slice(0, 400).toLowerCase();

  // ── Fast path: standardized naming convention ─────────────────────────────
  if (/^website visitors\//i.test(name)) return { category: "signal", subcategory: "website_visitor" };
  if (/^cold campaign\//i.test(name)) return { category: "cold" };
  if (/^event\//i.test(name)) return { category: "micro", subcategory: "event_invite" };

  // ── Micro: Webinar ────────────────────────────────────────────────────────
  if (/webinar/i.test(name) || /webinar/i.test(subject) || /webinar/i.test(body.slice(0, 150))) {
    return { category: "micro", subcategory: "webinar" };
  }

  // ── Micro: Event Invite ───────────────────────────────────────────────────
  const microNamePatterns = [
    "micro - ", "event invite", "barcelona event", "paris event", "post-event",
    "london networking", "shoptalk", "high point", "las vegas market",
    "hackaton", "hackathon", "n8n meetup", "vivatech", "inbound",
    "buyers club", "vip buyer", "top buyer", "priority buyer", "accio work new york",
    "ftl campaign", "b2b ecommerce word", "[pad]",
    "aiga", "anf - vasto", "micro - pa", "micro - ent", "micro - smb",
    "micro - dati", "micro - partnership", "micro - aiga", "micro - event",
    "micro - pre", "micro - post", "pre evento", "post evento",
  ];
  if (microNamePatterns.some(k => n.includes(k))) {
    return { category: "micro", subcategory: "event_invite" };
  }
  if (
    /you'?re invited|we'?re hosting.{0,30}(event|drinks|get-together|rooftop|dinner)|exclusive.{0,20}(event|gathering|rooftop)|caffè|café|coffee.{0,15}event|invited to.{0,20}(an?|our).{0,20}(exclusive|event|workshop)/i.test(s + " " + body.slice(0, 200))
  ) {
    return { category: "micro", subcategory: "event_invite" };
  }

  // ── Signal: Website Visitor ───────────────────────────────────────────────
  if (
    /website.?visitor|rb2b|warmly/i.test(name) ||
    /\[workflows\.io\]\s*website visitor/i.test(name) ||
    /saw.{0,10}you.{0,20}(check|visit|explor).{0,20}(our.{0,10})?(site|website)/i.test(b) ||
    /noticed.{0,10}you.{0,20}(check|visit|explor).{0,20}(our.{0,10})?(site|website)/i.test(b)
  ) {
    return { category: "signal", subcategory: "website_visitor" };
  }

  // ── Signal: Customer Alumni ───────────────────────────────────────────────
  // "Champion Tracking" = former users at their new company
  if (
    /champion tracking|customer.{0,10}alumni/i.test(name) ||
    /in your last role at/i.test(b) ||
    /used.{0,20}(heyreach|momentic|fullenrich|clay|blotout).{0,30}(back|previously|in your last|at {{)/i.test(b)
  ) {
    return { category: "signal", subcategory: "customer_alumni" };
  }

  // ── Signal: LinkedIn Engagement ───────────────────────────────────────────
  if (
    /linkedin.{0,20}(follower|engagement)|individual linkedin followers|company linkedin followers/i.test(name) ||
    /\[linkedin follow-up\]|linkedin follow-up|heyreach.{0,20}(not accepted|message sent|accepted)/i.test(name) ||
    /signal.*linkedin|signal.*heyreach/i.test(name) ||
    /archive.*brand mention/i.test(n) ||
    /archive.*competitor mention/i.test(n) ||
    /you follow.{0,20}(us|heyreach|clay|fullenrich)/i.test(b) ||
    /following.{0,10}(us|heyreach|clay|fullenrich)\s+on/i.test(b) ||
    /saw your (post|comment|like) on linkedin/i.test(b) ||
    /you'?re following.{0,20}(heyreach|us)/i.test(b) ||
    /followed.{0,20}(heyreach|us|our) on linkedin/i.test(b) ||
    /linkedin engagement outbound/i.test(name)
  ) {
    return { category: "signal", subcategory: "linkedin_engagement" };
  }

  // ── Signal: Competitor Followers / Tech Stack ─────────────────────────────
  const competitorPatterns = [
    "elevar", "freshpaint", "playwright", "appium", "salsify", "akeneo",
    "qa wolf", "clay followers", "clay template", "builtwith", "competitor tool",
    "using competitor", "tesorio", "campfire campaign", "growfin", "upflow",
    "rillet campaign", "monk competitor", "stripe campaign", "gorgias renewal",
    "zoominfo", "apollo.*credits angle",
  ];
  if (competitorPatterns.some(k => n.includes(k))) {
    return { category: "signal", subcategory: "competitor_followers" };
  }
  if (
    /saw.{0,10}{{companyname}}.{0,20}(run|use|uses|runs).{0,20}(gorgias|elevar|stripe|salsify|playwright|appium|zoominfo|clay|apollo|hubspot)/i.test(b) ||
    /after.{0,20}(their|elevar.{0,10})recent.{0,20}pricing/i.test(b) ||
    /(elevar|salsify|freshpaint).{0,20}(altern|switch|raising|price)/i.test(b)
  ) {
    return { category: "signal", subcategory: "competitor_followers" };
  }

  // ── Signal: Job Opening ───────────────────────────────────────────────────
  if (
    /job.?opening|hiring for (qa|cto|vp|head)|open jobs campaign|job openings|ecom job opening|product catalog job/i.test(name) ||
    /saw you.{0,20}(recently )?(posted|posted a role|hiring|recruit)/i.test(b) ||
    /came across your.{0,20}(qa|qe|testing).{0,20}opening/i.test(b) ||
    /i came across your.{0,20}(qa|qe).{0,20}opening/i.test(b) ||
    /{{job(title)?( open)?}}.{0,30}(role|hire|opening|position)/i.test(s)
  ) {
    return { category: "signal", subcategory: "job_opening" };
  }

  // ── Signal: New Hire ──────────────────────────────────────────────────────
  if (
    /new.?hires? campaign|congrats on the move/i.test(name) ||
    /looks like you recently joined/i.test(b) ||
    /recently joined.{0,30}{{/i.test(b) ||
    /saw.{0,10}you.{0,10}(recently|just).{0,10}joined/i.test(b)
  ) {
    return { category: "signal", subcategory: "new_hire" };
  }

  // ── Signal: Funding ───────────────────────────────────────────────────────
  if (
    /\bfunding\b|vc-funded|vc funded/i.test(name) ||
    /per 7\.1|gll.*vc|health check.*tag.*jan 2/i.test(n) ||
    /saw.{0,10}{{companyname}}.{0,30}(recently )?(closed|raised).{0,20}(its )?(funding|round)/i.test(b) ||
    /as part.{0,10}{{vc name}}.{0,10}portfolio/i.test(b) ||
    /your.{0,10}{{fundinground}}/i.test(b)
  ) {
    return { category: "signal", subcategory: "funding" };
  }

  return { category: "cold" };
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
      "fields[]": [
        "Campaign Name",
        "Positive Replies",
        "Positive Reply Rate (All Time)",
        "Reply Rate (All Time)",
        "Status",
        "Decision Makers",
        "Angle",
      ],
    });

    const perfMap = new Map<string, {
      positiveReplies: number;
      positiveReplyRate: number | null;
      replyRate: number | null;
      status: "Active" | "Paused" | "Draft" | null;
      decisionMakers: string;
      angle: string;
      masterRecordId: string;
    }>();
    for (const rec of masterData.records ?? []) {
      const f = rec.fields;
      const name: string = f["Campaign Name"] ?? "";
      const pos: number = f["Positive Replies"] ?? 0;
      const posRate: number | null = f["Positive Reply Rate (All Time)"] ?? null;
      const replyRate: number | null = f["Reply Rate (All Time)"] ?? null;
      const status = (f["Status"] as "Active" | "Paused" | "Draft") ?? null;
      perfMap.set(name.trim(), {
        positiveReplies: pos,
        positiveReplyRate: posRate !== null ? Math.round(posRate * 10) / 10 : null,
        replyRate: replyRate !== null ? Math.round(replyRate * 10) / 10 : null,
        status,
        decisionMakers: f["Decision Makers"] ?? "",
        angle: f["Angle"] ?? "",
        masterRecordId: rec.id,
      });
    }

    const entries = Array.from(clientKeyMap.entries());
    const rawClients = await Promise.allSettled(
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

          const perf = perfMap.get(c.name?.trim()) ?? { positiveReplies: 0, positiveReplyRate: null, replyRate: null, status: null, decisionMakers: "", angle: "", masterRecordId: null };
          const hasLinkedIn = steps.some((s) => s.channel === "linkedin");
          const firstStep = steps[0];
          const cls = classifyCampaign(
            c.name ?? "",
            firstStep?.subject ?? "",
            firstStep?.body ?? ""
          );
          campaigns.push({
            id: c.id,
            name: c.name ?? "Untitled",
            client: name,
            channel: hasLinkedIn ? "LinkedIn" : "Email",
            positiveReplies: perf.positiveReplies,
            positiveReplyRate: perf.positiveReplyRate,
            replyRate: perf.replyRate,
            status: perf.status,
            decisionMakers: perf.decisionMakers,
            angle: perf.angle,
            masterRecordId: perf.masterRecordId,
            steps,
            category: cls.category,
            subcategory: cls.subcategory,
          });
        }

        return { id: clientId, name, campaigns };
      })
    );

    const instantlyClients: CopyClient[] = rawClients
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((c): c is NonNullable<typeof c> => c !== null && c.campaigns.length > 0)
      .map(({ id, name, campaigns }) => {
        const baseName = name.split(" - ")[0].trim();
        const acct = ACCOUNT_DATA[baseName] ?? ACCOUNT_DATA[name];
        return {
          id,
          name,
          accountOwner: acct?.owner ?? "",
          accountManager: acct?.manager ?? "",
          accountDescription: acct?.description ?? "",
          campaigns: campaigns.sort((a, b) => b.positiveReplies - a.positiveReplies),
        };
      });

    // Merge GDrive LinkedIn campaigns: attach to existing Instantly client by base name,
    // or create a new synthetic client entry if not found.
    const clients = instantlyClients.slice(); // mutable copy
    for (const gdc of GDRIVE_LINKEDIN_CAMPAIGNS) {
      const gdBase = gdc.client.split(" - ")[0].trim().toLowerCase();
      const existing = clients.find(
        (c) => c.name.split(" - ")[0].trim().toLowerCase() === gdBase
      );
      if (existing) {
        existing.campaigns.push(gdc);
      } else {
        const acct = ACCOUNT_DATA[gdc.client];
        clients.push({
          id: `gdrive-${gdc.client.toLowerCase().replace(/\s+/g, "-")}`,
          name: gdc.client,
          accountOwner: acct?.owner ?? "",
          accountManager: acct?.manager ?? "",
          accountDescription: acct?.description ?? "",
          campaigns: [gdc],
        });
      }
    }

    clients.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(clients);
  } catch (err) {
    console.error("[copy-library]", err);
    return NextResponse.json({ error: "Failed to load copy library" }, { status: 500 });
  }
}

// Campaign type prefixes — enforces the naming convention
const CAMPAIGN_PREFIXES: Record<string, string> = {
  "Website Visitors": "Website Visitors",
  "Cold Campaign": "Cold Campaign",
  "Event": "Event",
};

/**
 * POST /api/campaigns
 * Body: { clientId: string, type: "Website Visitors"|"Cold Campaign"|"Event", suffix: string }
 * Creates a campaign in the client's Instantly account with the enforced naming convention.
 */
export async function POST(req: Request) {
  let body: { clientId?: string; type?: string; suffix?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { clientId, type, suffix } = body;
  if (!clientId || !type || !suffix?.trim()) {
    return NextResponse.json({ error: "clientId, type, and suffix are required" }, { status: 400 });
  }

  const prefix = CAMPAIGN_PREFIXES[type];
  if (!prefix) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${Object.keys(CAMPAIGN_PREFIXES).join(", ")}` },
      { status: 400 }
    );
  }

  const campaignName = `${prefix}/${suffix.trim()}`;

  // Look up the client's Instantly API key from Airtable
  const inboxData = await airtableGet("tblAoAKC7h3y4cl7y", {
    maxRecords: "200",
    "fields[]": ["Client Name", "Client", "Instantly API Key"],
  });

  let instantlyApiKey: string | null = null;
  for (const rec of inboxData.records ?? []) {
    const clientIds: string[] = rec.fields["Client"] ?? [];
    if (clientIds.includes(clientId) && rec.fields["Instantly API Key"]) {
      instantlyApiKey = rec.fields["Instantly API Key"];
      break;
    }
  }

  if (!instantlyApiKey) {
    return NextResponse.json({ error: "No Instantly API key found for this client" }, { status: 404 });
  }

  // Create the campaign in Instantly
  const createRes = await fetch("https://api.instantly.ai/api/v2/campaigns", {
    method: "POST",
    headers: { ...INSTANTLY_HEADERS, Authorization: `Bearer ${instantlyApiKey}` },
    body: JSON.stringify({ name: campaignName }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => "");
    console.error("[create-campaign] Instantly error:", createRes.status, errText);
    return NextResponse.json(
      { error: `Instantly API error: ${createRes.status}`, detail: errText },
      { status: 502 }
    );
  }

  const created = await createRes.json();
  return NextResponse.json({ id: created.id, name: campaignName }, { status: 201 });
}
