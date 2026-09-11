import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Step = { channel: "email" | "linkedin"; subject?: string; body: string };
type SequenceInput = {
  title: string;
  client: string;
  category: string;
  decisionMakers?: string;
  angle?: string;
  steps: Step[];
};

function buildStepsBlock(steps: Step[]): string {
  return steps
    .map((step, i) => {
      const header = `### Step ${i + 1} — ${step.channel === "email" ? "Email" : "LinkedIn Message"}`;
      const subject = step.channel === "email" && step.subject
        ? `**Subject:** ${step.subject}\n`
        : "";
      return `${header}\n${subject}${step.body}`;
    })
    .join("\n\n---\n\n");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: SequenceInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, client, category, decisionMakers, angle, steps } = body;
  if (!title || !steps?.length) {
    return NextResponse.json({ error: "Sequence data required" }, { status: 400 });
  }

  const channelSummary = steps.every((s) => s.channel === "email")
    ? "email-only"
    : steps.every((s) => s.channel === "linkedin")
    ? "LinkedIn-only"
    : "multi-channel (email + LinkedIn)";

  const stepsBlock = buildStepsBlock(steps);

  const systemPrompt = `You are a senior GTM engineer writing a precise Claude Code instruction prompt.
Your job is to write a ready-to-paste prompt for Claude Code that will:
1. Create an Instantly campaign with the exact copy provided
2. Add the sequence to the client's Copy Master Sheet in Google Drive

Rules for the output:
- Write in clear, direct imperative sentences — Claude Code is reading this, not a human
- Include ALL sequence copy verbatim — every subject line and body, word for word
- Be extremely specific about field mappings for Instantly (campaign name, steps, subjects, bodies)
- Be specific about the Google Drive structure (find the client folder, add a new row/section)
- Include a "Context" block at the top so Claude Code understands what it's looking at
- Format with markdown headers and code blocks where appropriate
- Do NOT add unnecessary filler text or explanations
- The tone is technical and operational — this is a deployment instruction, not a brief
- End with a clear "When done, confirm:" checklist

Output only the Claude Code prompt text itself — no wrapping, no meta-commentary.`;

  const userMessage = `Write a Claude Code prompt for this outbound sequence:

SEQUENCE TITLE: ${title}
CLIENT: ${client}
PLAY TYPE: ${category}
DECISION MAKERS TARGETED: ${decisionMakers || "Not specified"}
ANGLE: ${angle || "Not specified"}
CHANNEL: ${channelSummary}
TOTAL STEPS: ${steps.length}

FULL COPY:
${stepsBlock}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    const prompt = response.choices[0]?.message?.content ?? "";
    if (!prompt) throw new Error("Empty response from AI");

    return NextResponse.json({ prompt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[claude-prompt] OpenAI error:", message);
    return NextResponse.json({ error: "AI generation failed", detail: message }, { status: 500 });
  }
}
