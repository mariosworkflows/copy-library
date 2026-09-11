const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const USERS_TABLE = "tblBiH6GFPPrMWP4m";

export interface ApiKeyUser {
  recordId: string;
  email: string;
  name: string;
}

// Validate an API key and return the owning user, or null if invalid.
export async function validateApiKey(key: string): Promise<ApiKeyUser | null> {
  if (!key?.startsWith("wf_") || key.length < 35) return null;

  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}`);
  url.searchParams.set("filterByFormula", `{ApiKey}="${key}"`);
  url.searchParams.set("maxRecords", "1");
  url.searchParams.set("fields[]", "Email");
  url.searchParams.set("fields[]", "Name");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  const record = data.records?.[0];
  if (!record) return null;

  return {
    recordId: record.id,
    email: record.fields.Email as string,
    name: record.fields.Name as string,
  };
}

// Generate a new API key string (not stored — caller must persist it).
export function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `wf_${hex}`;
}

// Save (or clear) the API key on a user's Airtable record.
export async function setUserApiKey(recordId: string, key: string | null): Promise<void> {
  await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}/${recordId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: { ApiKey: key ?? "" } }),
  });
}

// Get the current API key for a user (for display purposes).
export async function getUserApiKey(email: string): Promise<{ recordId: string; apiKey: string | null } | null> {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}`);
  url.searchParams.set("filterByFormula", `{Email}="${email.toLowerCase()}"`);
  url.searchParams.set("maxRecords", "1");
  url.searchParams.set("fields[]", "ApiKey");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  const record = data.records?.[0];
  if (!record) return null;

  return {
    recordId: record.id,
    apiKey: (record.fields.ApiKey as string) || null,
  };
}
