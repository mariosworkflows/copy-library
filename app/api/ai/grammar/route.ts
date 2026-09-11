import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { subject?: string; body?: string; channel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { subject, body: text, channel } = body;
  if (!text?.trim()) return NextResponse.json({ error: "No text to check" }, { status: 400 });

  const channelContext = channel === "linkedin"
    ? "a LinkedIn direct message for B2B sales outreach"
    : "a B2B sales email";

  const textToCheck = subject ? `Subject: ${subject}\n\nBody:\n${text}` : text;

  const systemPrompt = `You are a professional B2B copywriter and grammar expert reviewing outbound sales copy for ${channelContext}.

Return ONLY a JSON object (no markdown, no extra text) with this exact structure:
{
  "score": "clean" | "minor" | "needs_work",
  "summary": "One sentence overall assessment",
  "issues": [
    {
      "type": "Grammar" | "Spelling" | "Punctuation" | "Clarity" | "Tone" | "Structure",
      "original": "exact problematic text",
      "suggestion": "corrected version",
      "explanation": "brief explanation why"
    }
  ],
  "correctedBody": "full corrected body text only",
  "correctedSubject": "corrected subject line or null"
}

Scoring:
- "clean" = 0–1 very minor issues
- "minor" = 2–4 small fixable issues
- "needs_work" = 5+ issues or fundamental problems

Check for: grammar errors, spelling mistakes, punctuation, run-on sentences, unclear phrasing, robotic/formal tone, weak CTAs, generic/cliché phrases.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: textToCheck },
      ],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[grammar] OpenAI error:", message);
    return NextResponse.json(
      { error: "AI check failed", detail: message },
      { status: 500 }
    );
  }
}
