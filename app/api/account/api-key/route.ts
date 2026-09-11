import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { generateApiKey, getUserApiKey, setUserApiKey } from "@/lib/api-key";

export const dynamic = "force-dynamic";

// GET — fetch whether a key exists (never returns the raw key)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getUserApiKey(session.user.email);
  if (!result) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    hasKey: !!result.apiKey,
    // Show only the prefix for identification — never the full key after generation
    preview: result.apiKey ? `${result.apiKey.slice(0, 10)}…` : null,
  });
}

// POST — generate a new API key (returns it once — never retrievable again)
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getUserApiKey(session.user.email);
  if (!result) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const newKey = generateApiKey();
  await setUserApiKey(result.recordId, newKey);

  return NextResponse.json({
    key: newKey,
    preview: `${newKey.slice(0, 10)}…`,
  });
}

// DELETE — revoke the API key
export async function DELETE(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getUserApiKey(session.user.email);
  if (!result) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await setUserApiKey(result.recordId, null);
  return NextResponse.json({ ok: true });
}
