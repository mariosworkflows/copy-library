"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, Linkedin, Copy, Check, ArrowLeft, PenLine, Plus, Trash2, X, Loader2,
  Users, Zap, CalendarDays, DollarSign, UserPlus, Briefcase, RotateCcw,
  ThumbsUp, Eye, Globe, Video, MapPin, ChevronDown, ChevronRight,
  BookOpen, LogOut, Save, CheckCircle2, AlertCircle,
  Sparkles, CircleCheck, CircleAlert, CircleDot, ChevronUp,
} from "lucide-react";
import type { CopyClient, CopyCampaign, CopyStep } from "@/lib/copy-types";

// ── Design tokens ─────────────────────────────────────────────────────────

const P = {
  bg:          "#F5F4F0",
  surface:     "#FAFAF8",
  border:      "#E8E7E3",
  text:        "#1C1B18",
  subtext:     "#6B6860",
  muted:       "#8B8A86",
  label:       "#A8A69F",
  primary:     "linear-gradient(135deg,#1c1c1e 0%,#2d2d30 100%)",
  primarySolid:"#1c1c1e",
  chip:        "#EEEDEA",
  chipActive:  "#1c1c1e",
  chipText:    "#8B8A86",
  chipTextActive: "#fff",
};

// ── Grammar types ─────────────────────────────────────────────────────────

type GrammarIssue = { type: string; original: string; suggestion: string; explanation: string };
type GrammarResult = {
  score: "clean" | "minor" | "needs_work";
  summary: string;
  issues: GrammarIssue[];
  correctedBody: string;
  correctedSubject: string | null;
};
const SCORE_META = {
  clean:      { label: "Clean",        color: "#16a34a", bg: "#f0fdf4", Icon: CircleCheck },
  minor:      { label: "Minor issues", color: "#d97706", bg: "#fffbeb", Icon: CircleDot   },
  needs_work: { label: "Needs work",   color: "#dc2626", bg: "#fef2f2", Icon: CircleAlert },
};

// ── Category taxonomy ──────────────────────────────────────────────────────

type NavLeaf = { label: string; key: string; icon: React.ReactNode };
type NavGroup = { label: string; key: string; icon: React.ReactNode; children: NavLeaf[] };
type NavItem = NavLeaf | NavGroup;

const CATEGORY_NAV: NavItem[] = [
  { label: "Cold", key: "cold", icon: <Users className="w-3.5 h-3.5" /> },
  {
    label: "Signal-based", key: "signal", icon: <Zap className="w-3.5 h-3.5" />,
    children: [
      { label: "Funding", key: "signal:funding", icon: <DollarSign className="w-3 h-3" /> },
      { label: "New Hire", key: "signal:new_hire", icon: <UserPlus className="w-3 h-3" /> },
      { label: "Job Opening", key: "signal:job_opening", icon: <Briefcase className="w-3 h-3" /> },
      { label: "Customer Alumni", key: "signal:customer_alumni", icon: <RotateCcw className="w-3 h-3" /> },
      { label: "LinkedIn Engagement", key: "signal:linkedin_engagement", icon: <ThumbsUp className="w-3 h-3" /> },
      { label: "Competitor Followers", key: "signal:competitor_followers", icon: <Eye className="w-3 h-3" /> },
      { label: "Website Visitor", key: "signal:website_visitor", icon: <Globe className="w-3 h-3" /> },
    ],
  },
  {
    label: "Micro", key: "micro", icon: <CalendarDays className="w-3.5 h-3.5" />,
    children: [
      { label: "Webinar", key: "micro:webinar", icon: <Video className="w-3 h-3" /> },
      { label: "Event Invite", key: "micro:event_invite", icon: <MapPin className="w-3 h-3" /> },
    ],
  },
];

const CATEGORY_OPTIONS = [
  { value: "cold", label: "Cold" },
  { value: "signal:funding", label: "Signal · Funding" },
  { value: "signal:new_hire", label: "Signal · New Hire" },
  { value: "signal:job_opening", label: "Signal · Job Opening" },
  { value: "signal:customer_alumni", label: "Signal · Customer Alumni" },
  { value: "signal:linkedin_engagement", label: "Signal · LinkedIn Engagement" },
  { value: "signal:competitor_followers", label: "Signal · Competitor Followers" },
  { value: "signal:website_visitor", label: "Signal · Website Visitor" },
  { value: "micro:webinar", label: "Micro · Webinar" },
  { value: "micro:event_invite", label: "Micro · Event Invite" },
];

function categoryKeyOf(c: CopyCampaign): string {
  if (c.category === "cold") return "cold";
  return `${c.category}:${c.subcategory ?? ""}`;
}

function labelForKey(key: string): string {
  if (key === "cold") return "Cold";
  for (const item of CATEGORY_NAV) {
    if ("children" in item) {
      for (const child of item.children) {
        if (child.key === key) return `${item.label} · ${child.label}`;
      }
    }
  }
  return key;
}

// ── ClientLogo ────────────────────────────────────────────────────────────

function ClientLogo({ name, domain }: { name: string; domain?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .replace(/\s*[-–(].*$/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (!domain || failed) {
    return (
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: P.chip, color: P.subtext }}>
        {initials}
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: "#fff", border: `1px solid ${P.border}` }}>
      <img src={`https://logo.clearbit.com/${domain}`} alt={name}
        className="w-7 h-7 object-contain" onError={() => setFailed(true)} />
    </div>
  );
}

// ── Sequence Writer ───────────────────────────────────────────────────────

interface SeqStep {
  id: string;
  channel: "email" | "linkedin";
  subject: string;
  body: string;
}

function uid() { return Math.random().toString(36).slice(2); }

type SaveState = "idle" | "saving" | "saved" | "error";

function SequenceWriterPanel({
  open, onClose, steps, setSteps, activeStep, setActiveStep, clients,
}: {
  open: boolean;
  onClose: () => void;
  steps: SeqStep[];
  setSteps: React.Dispatch<React.SetStateAction<SeqStep[]>>;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  clients: CopyClient[];
}) {
  const [seqType, setSeqType] = useState("Cold Campaign");
  const [seqSuffix, setSeqSuffix] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Cold");
  const title = seqSuffix.trim() ? `${seqType}/${seqSuffix.trim()}` : "";
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarResult, setGrammarResult] = useState<GrammarResult | null>(null);
  const [grammarOpen, setGrammarOpen] = useState(false);
  const [showCorrected, setShowCorrected] = useState(false);

  function addStep() {
    const lastChannel = steps[steps.length - 1]?.channel ?? "email";
    setSteps((prev) => [...prev, { id: uid(), channel: lastChannel, subject: "", body: "" }]);
    setActiveStep(steps.length);
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
    setActiveStep((prev) => Math.max(0, prev > i ? prev - 1 : prev === i ? Math.max(0, prev - 1) : prev));
  }

  function updateStep(i: number, patch: Partial<SeqStep>) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
    if (patch.body !== undefined || patch.subject !== undefined) {
      setGrammarResult(null);
      setGrammarOpen(false);
    }
  }

  async function checkGrammar() {
    if (!currentStep?.body.trim()) return;
    setGrammarLoading(true);
    setGrammarResult(null);
    setGrammarOpen(true);
    setShowCorrected(false);
    try {
      const res = await fetch("/api/ai/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentStep.channel === "email" ? currentStep.subject : undefined,
          body: currentStep.body,
          channel: currentStep.channel,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? data.detail ?? "API error");
      setGrammarResult(data);
    } catch (err) {
      setGrammarResult({
        score: "needs_work",
        summary: `Error: ${err instanceof Error ? err.message : "Could not analyse. Try again."}`,
        issues: [{ type: "Error", original: "", suggestion: "", explanation: "The grammar check failed. Make sure you're logged in and try again." }],
        correctedBody: "",
        correctedSubject: null,
      });
    } finally {
      setGrammarLoading(false);
    }
  }

  async function handleSave() {
    if (!seqSuffix.trim()) {
      setSaveError("Add a sequence name before saving.");
      return;
    }
    const hasContent = steps.some((s) => s.body.trim());
    if (!hasContent) {
      setSaveError("Write at least one step before saving.");
      return;
    }

    setSaveError("");
    setSaveState("saving");

    try {
      const isUpdate = !!savedId;
      const url = isUpdate ? `/api/sequences/${savedId}` : "/api/sequences";
      const method = isUpdate ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          client: selectedClient,
          category: selectedCategory,
          steps: steps.map(({ id: _id, ...rest }) => rest),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      if (!isUpdate && data.id) setSavedId(data.id);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }

  const clientOptions = Array.from(
    new Set(clients.map((c) => c.name.split(" - ")[0].trim()))
  ).sort();

  const currentStep = steps[activeStep];
  const wordCount = currentStep?.body.trim().split(/\s+/).filter(Boolean).length ?? 0;
  const totalWords = steps.reduce((a, s) => a + s.body.trim().split(/\s+/).filter(Boolean).length, 0);

  return (
    <div
      className="flex-shrink-0 flex flex-col h-full overflow-hidden transition-all duration-300"
      style={{
        width: open ? 360 : 0,
        borderLeft: open ? `1px solid ${P.border}` : "none",
        background: "#fff",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4" style={{ color: P.subtext }} />
          <span className="text-sm font-semibold text-gray-900">Sequence Writer</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Metadata */}
      <div className="px-4 pt-3 pb-2 space-y-2 flex-shrink-0" style={{ borderBottom: `1px solid ${P.border}` }}>
        <div className="flex gap-2">
          <select
            value={seqType}
            onChange={(e) => setSeqType(e.target.value)}
            className="flex-shrink-0 px-2.5 py-2 rounded-xl text-xs font-semibold outline-none transition-all"
            style={{ background: P.chip, border: `1px solid ${P.border}`, color: P.subtext, cursor: "pointer" }}>
            <option>Ad Engagement</option>
            <option>Brand Mentions</option>
            <option>Closed Lost Reopens</option>
            <option>Cold Campaign</option>
            <option>Competitor Brand Mentions</option>
            <option>Connections of Founders / C-Levels</option>
            <option>Customer Alumni</option>
            <option>Downloaded a Lead Magnet</option>
            <option>Event</option>
            <option>Followers of Competitors Company's Page on LinkedIn</option>
            <option>Followers of Your Company's Page on LinkedIn</option>
            <option>G2 Profile Visits</option>
            <option>Glassdoor Reviews</option>
            <option>Google Reviews</option>
            <option>Hiring / Open Jobs</option>
            <option>Influencers Content Engagement</option>
            <option>Integration Overlap</option>
            <option>Job Changes of Champions</option>
            <option>LinkedIn Connections of Your Competitors</option>
            <option>LinkedIn Engagement</option>
            <option>LinkedIn Profile Visitors</option>
            <option>Multi-Thread Inbound Requests</option>
            <option>Mutual VC Portfolio Companies</option>
            <option>New ICP Hires</option>
            <option>Newsletter Subscribers</option>
            <option>Raised New Funding Round</option>
            <option>Searching for a Specific Keyword</option>
            <option>Specific Post Scraping</option>
            <option>Upcoming Event Attendees</option>
            <option>Using Specific Tech</option>
            <option>Website Visitors</option>
            <option>Yours / C-Suite / Advisors LinkedIn Network</option>
          </select>
          <input
            type="text"
            value={seqSuffix}
            onChange={(e) => setSeqSuffix(e.target.value)}
            placeholder="Sequence name…"
            className="flex-1 px-3 py-2 rounded-xl text-sm font-medium outline-none transition-all"
            style={{ background: "#FAFAF8", border: `1.5px solid ${P.border}`, color: P.text }}
            onFocus={(e) => (e.target.style.borderColor = P.subtext)}
            onBlur={(e) => (e.target.style.borderColor = P.border)}
          />
        </div>
        {seqSuffix.trim() && (
          <p className="text-xs font-mono px-1" style={{ color: "#94a3b8" }}>
            {seqType}/{seqSuffix.trim()}
          </p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            list="client-options"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            placeholder="Client…"
            className="flex-1 px-2 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: "#FAFAF8", border: `1.5px solid ${P.border}`, color: P.text }}
            onFocus={(e) => (e.target.style.borderColor = P.subtext)}
            onBlur={(e) => (e.target.style.borderColor = P.border)}
          />
          <datalist id="client-options">
            {clientOptions.map((c) => <option key={c} value={c} />)}
          </datalist>
          <input
            type="text"
            list="category-options"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            placeholder="Category…"
            className="flex-1 px-2 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: "#FAFAF8", border: `1.5px solid ${P.border}`, color: P.text }}
            onFocus={(e) => (e.target.style.borderColor = P.subtext)}
            onBlur={(e) => (e.target.style.borderColor = P.border)}
          />
          <datalist id="category-options">
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.label} />)}
          </datalist>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex items-center gap-1 px-3 py-2 flex-shrink-0 overflow-x-auto"
        style={{ borderBottom: `1px solid ${P.border}` }}>
        {steps.map((step, i) => (
          <div key={step.id} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={activeStep === i ? { background: P.primarySolid, color: "#fff" } : { background: P.chip, color: P.muted }}>
            <button onClick={() => setActiveStep(i)}>Step {i + 1}</button>
            {steps.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeStep(i); }}
                className="opacity-50 hover:opacity-100 transition-opacity ml-0.5"
                style={{ color: activeStep === i ? "#fff" : "#9ca3af" }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addStep}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all"
          style={{ color: "#9ca3af" }}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Step editor */}
      {currentStep && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Channel toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <button
              onClick={() => updateStep(activeStep, { channel: "email" })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all"
              style={currentStep.channel === "email"
                ? { background: P.primarySolid, color: "#fff" }
                : { color: P.muted }}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
            <button
              onClick={() => updateStep(activeStep, { channel: "linkedin" })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all"
              style={currentStep.channel === "linkedin"
                ? { background: "#0A66C2", color: "#fff" }
                : { color: P.muted }}
            >
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </button>
          </div>

          {/* Subject */}
          {currentStep.channel === "email" && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Subject</label>
              <input
                type="text"
                value={currentStep.subject}
                onChange={(e) => updateStep(activeStep, { subject: e.target.value })}
                placeholder="Subject line…"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "#FAFAF8", border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          )}

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</label>
            <textarea
              value={currentStep.body}
              onChange={(e) => updateStep(activeStep, { body: e.target.value })}
              placeholder={currentStep.channel === "linkedin" ? "LinkedIn message…" : "Email body…"}
              rows={12}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none leading-relaxed"
              style={{ background: "#FAFAF8", border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{wordCount} words · {totalWords} total</span>
            {steps.length > 1 && (
              <button onClick={() => removeStep(activeStep)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete step
              </button>
            )}
          </div>

          {/* Grammar check + Copy Auditor */}
          <div className="flex gap-2">
            <button
              onClick={checkGrammar}
              disabled={grammarLoading || !currentStep?.body.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all"
              style={{
                background: grammarResult ? SCORE_META[grammarResult.score].bg : P.chip,
                color: grammarResult ? SCORE_META[grammarResult.score].color : P.subtext,
                border: `1.5px solid ${grammarResult ? SCORE_META[grammarResult.score].color + "33" : P.border}`,
              }}
            >
              {grammarLoading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking…</>
                : <><Sparkles className="w-3.5 h-3.5" /> {grammarResult ? "Re-check" : "Grammar"}</>}
            </button>
            <button
              disabled
              title="Coming soon — powered by deep copy knowledge"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold opacity-50 cursor-not-allowed"
              style={{ background: "#fdf4ff", color: "#9333ea", border: "1.5px solid #e9d5ff" }}
            >
              <BookOpen className="w-3.5 h-3.5" /> Copy Auditor
            </button>
          </div>

          {/* Grammar results */}
          {grammarOpen && (
            <div className="rounded-xl overflow-hidden"
              style={{ border: `1.5px solid ${grammarResult ? SCORE_META[grammarResult.score].color + "33" : "#e5e7eb"}` }}>
              <div className="flex items-center justify-between px-3 py-2.5"
                style={{ background: grammarResult ? SCORE_META[grammarResult.score].bg : "#f9fafb", borderBottom: `1px solid ${P.border}` }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: grammarResult ? SCORE_META[grammarResult.score].color : P.subtext }} />
                  <span className="text-xs font-bold" style={{ color: grammarResult ? SCORE_META[grammarResult.score].color : "#6b7280" }}>
                    Grammar Check
                  </span>
                  {grammarResult && (() => {
                    const { label, color, bg, Icon } = SCORE_META[grammarResult.score];
                    return (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: color + "18", color }}>
                        <Icon className="w-3 h-3" /> {label}
                      </span>
                    );
                  })()}
                </div>
                <button onClick={() => setGrammarOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-white px-3 py-3 space-y-3">
                {grammarLoading && (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: P.subtext }} />
                    <span className="text-xs text-gray-500">Analysing your copy…</span>
                  </div>
                )}
                {grammarResult && !grammarLoading && (
                  <>
                    <p className="text-xs text-gray-600 leading-relaxed">{grammarResult.summary}</p>
                    {grammarResult.issues.map((issue, i) => (
                      <div key={i} className="rounded-lg p-3" style={{ background: "#f9fafb", border: `1px solid ${P.border}` }}>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block"
                          style={{ background: P.chip, color: P.subtext }}>{issue.type}</span>
                        <p className="text-xs text-gray-400 line-through mb-0.5">{issue.original}</p>
                        <p className="text-xs font-medium text-gray-800 mb-1">→ {issue.suggestion}</p>
                        <p className="text-xs text-gray-400">{issue.explanation}</p>
                      </div>
                    ))}
                    {grammarResult.issues.length === 0 && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#16a34a" }} />
                        <span className="text-xs text-gray-600">No issues — great copy!</span>
                      </div>
                    )}
                    {grammarResult.correctedBody && grammarResult.score !== "clean" && (
                      <div>
                        <button onClick={() => setShowCorrected((p) => !p)}
                          className="flex items-center gap-1 text-xs font-semibold mb-2"
                          style={{ color: P.subtext }}>
                          {showCorrected ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {showCorrected ? "Hide corrected version" : "Show corrected version"}
                        </button>
                        {showCorrected && (
                          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
                            <textarea readOnly value={grammarResult.correctedBody} rows={6}
                              className="w-full px-3 py-2 text-xs text-gray-700 leading-relaxed resize-none outline-none"
                              style={{ background: "#fff" }} />
                            <div className="px-3 py-2 flex justify-end" style={{ borderTop: `1px solid ${P.border}`, background: "#f9fafb" }}>
                              <button
                                onClick={() => {
                                  updateStep(activeStep, {
                                    body: grammarResult.correctedBody,
                                    ...(grammarResult.correctedSubject ? { subject: grammarResult.correctedSubject } : {}),
                                  });
                                  setGrammarOpen(false);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{ background: P.primary, color: "#fff" }}>
                                <CheckCircle2 className="w-3 h-3" /> Apply corrections
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save footer */}
      <div className="px-4 py-3 flex-shrink-0 space-y-2" style={{ borderTop: `1px solid ${P.border}` }}>
        {saveError && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#dc2626" }}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {saveError}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          style={
            saveState === "saved"
              ? { background: "#16a34a", color: "#fff" }
              : saveState === "error"
              ? { background: "#fef2f2", color: "#dc2626" }
              : { background: P.primary, color: "#fff" }
          }
        >
          {saveState === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
          {saveState === "saved" && <CheckCircle2 className="w-4 h-4" />}
          {saveState === "idle" || saveState === "error"
            ? <Save className="w-4 h-4" />
            : null}
          {saveState === "saving" ? "Saving…"
            : saveState === "saved" ? "Saved to My Sequences"
            : saveState === "error" ? "Failed — try again"
            : savedId ? "Update Sequence" : "Save Sequence"}
        </button>
      </div>
    </div>
  );
}

// ── Campaign Card ────────────────────────────────────────────────────────

function CampaignCard({ campaign, showClient = false, onClick }: {
  campaign: CopyCampaign; showClient?: boolean; onClick: () => void;
}) {
  const isLinkedIn = campaign.channel === "LinkedIn";
  return (
    <button onClick={onClick} className="text-left transition-all hover:scale-[1.02]"
      style={{
        aspectRatio: "1 / 1", background: "#fff", border: "1.5px solid #f0f0f0",
        borderRadius: 20, padding: 18, display: "flex", flexDirection: "column",
        justifyContent: "space-between", minWidth: 0,
      }}>
      <div className="flex items-start justify-between gap-2">
        <ClientLogo name={campaign.client} domain={campaign.clientDomain} />
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
          style={isLinkedIn ? { background: "#e8f0fe", color: "#0A66C2" } : { background: P.chip, color: P.subtext }}>
          {isLinkedIn ? <Linkedin className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
          {campaign.channel}
        </span>
      </div>
      <div>
        {showClient && <p className="text-xs text-gray-400 mb-0.5 truncate">{campaign.client}</p>}
        <p className="font-semibold text-sm leading-snug mb-1 text-gray-900 line-clamp-2">{campaign.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs text-gray-400">{campaign.steps.length} step{campaign.steps.length !== 1 ? "s" : ""}</p>
          {campaign.replyRate !== null && campaign.replyRate > 0 && (
            <p className="text-xs font-medium" style={{ color: P.text }}>{campaign.replyRate}% reply</p>
          )}
          {campaign.positiveReplyRate !== null && campaign.positiveReplyRate > 0 && (
            <p className="text-xs font-medium" style={{ color: "#16a34a" }}>{campaign.positiveReplyRate}% pos.</p>
          )}
          {campaign.status && campaign.status !== "Active" && (
            <span className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ background: campaign.status === "Paused" ? "#fef3c7" : "#f3f4f6", color: campaign.status === "Paused" ? "#92400e" : "#6b7280" }}>
              {campaign.status}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Channel grid ─────────────────────────────────────────────────────────

function ChannelGrid({ campaigns, onSelect }: { campaigns: CopyCampaign[]; onSelect: (c: CopyCampaign) => void }) {
  const email = campaigns.filter((c) => c.channel !== "LinkedIn");
  const linkedin = campaigns.filter((c) => c.channel === "LinkedIn");
  return (
    <div className="space-y-6">
      {email.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: P.chip, color: P.subtext }}>
              <Mail className="w-3.5 h-3.5" /> Email Copy
            </div>
            <span className="text-xs text-gray-400">{email.length} campaign{email.length !== 1 ? "s" : ""}</span>
            <div className="flex-1 h-px" style={{ background: "#f0f0f0" }} />
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
            {email.map((c) => <CampaignCard key={c.id} campaign={c} onClick={() => onSelect(c)} />)}
          </div>
        </div>
      )}
      {linkedin.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: "#e8f0fe", color: "#0A66C2" }}>
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn Copy
            </div>
            <span className="text-xs text-gray-400">{linkedin.length} campaign{linkedin.length !== 1 ? "s" : ""}</span>
            <div className="flex-1 h-px" style={{ background: "#f0f0f0" }} />
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
            {linkedin.map((c) => <CampaignCard key={c.id} campaign={c} onClick={() => onSelect(c)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Client sections (category view) ───────────────────────────────────────

function ClientSections({ campaigns, allClients, onSelect }: {
  campaigns: CopyCampaign[]; allClients: CopyClient[]; onSelect: (c: CopyCampaign) => void;
}) {
  const baseName = (name: string) => name.split(" - ")[0].trim();
  const baseNames = Array.from(new Set(campaigns.map((c) => baseName(c.client))));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {baseNames.map((clientBase) => {
        const clientCampaigns = campaigns.filter((c) => baseName(c.client) === clientBase);
        const clientData = allClients.find((c) => baseName(c.name) === clientBase);
        const open = expanded.has(clientBase);
        return (
          <div key={clientBase} className="rounded-2xl overflow-hidden"
            style={{ border: "1.5px solid #f0f0f0", background: "#fff" }}>
            <button onClick={() => toggle(clientBase)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50">
              <ClientLogo name={clientBase} domain={clientData?.domain} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{clientBase}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {clientCampaigns.length} campaign{clientCampaigns.length !== 1 ? "s" : ""}
                </p>
              </div>
              {open ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>
            {open && (
              <div className="px-5 pb-6 pt-2" style={{ borderTop: "1px solid #f5f5f5" }}>
                <ChannelGrid campaigns={clientCampaigns} onSelect={onSelect} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── New Campaign Modal ────────────────────────────────────────────────────

// ── Main page ────────────────────────────────────────────────────────────

type ActiveView = { type: "client"; clientId: string } | { type: "category"; key: string };

export default function CopyLibraryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<CopyClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>({ type: "category", key: "cold" });
  const [activeCampaign, setActiveCampaign] = useState<CopyCampaign | null>(null);
  const [activeStepId, setActiveStepId] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [seqOpen, setSeqOpen] = useState(false);
  const [seqSteps, setSeqSteps] = useState<SeqStep[]>([{ id: uid(), channel: "email", subject: "", body: "" }]);
  const [activeSeqStep, setActiveSeqStep] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["signal", "micro", "clients"]));

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data: CopyClient[]) => setClients(data))
      .catch(() => setError("Failed to load campaigns"))
      .finally(() => setLoading(false));
  }, []);

  const allCampaigns = clients.flatMap((c) => c.campaigns);
  const role = (session?.user as { role?: string })?.role;

  function countForKey(key: string) { return allCampaigns.filter((c) => categoryKeyOf(c) === key).length; }
  function countForGroup(groupKey: string) { return allCampaigns.filter((c) => c.category === groupKey).length; }

  function getViewCampaigns(): CopyCampaign[] {
    if (activeView.type === "client") return clients.find((c) => c.id === activeView.clientId)?.campaigns ?? [];
    return allCampaigns.filter((c) => categoryKeyOf(c) === activeView.key);
  }

  function getActiveStep(campaign: CopyCampaign): CopyStep {
    const id = activeStepId[campaign.id] ?? campaign.steps[0]?.id;
    return campaign.steps.find((s) => s.id === id) ?? campaign.steps[0];
  }

  async function copyText(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  }

  function loadCampaignIntoWriter(campaign: CopyCampaign) {
    const steps: SeqStep[] = campaign.steps.map((s) => ({
      id: uid(), channel: s.channel, subject: s.subject ?? "", body: s.body,
    }));
    setSeqSteps(steps.length > 0 ? steps : [{ id: uid(), channel: "email", subject: "", body: "" }]);
    setActiveSeqStep(0);
    setSeqOpen(true);
  }

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────

  const sidebar = (
    <div className="w-56 flex-shrink-0 flex flex-col h-full overflow-y-auto"
      style={{ background: "#fff", borderRight: `1px solid ${P.border}` }}>
      {/* Branding */}
      <div className="px-5 py-4 flex-shrink-0 flex items-center gap-3" style={{ borderBottom: `1px solid ${P.border}` }}>
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <g clipPath="url(#clip0_wf_cl)">
            <path d="M11.7321 0.347174C11.5947 0.38962 11.4874 0.447047 10.8831 0.794107C10.596 0.958899 10.1166 1.23105 9.82199 1.39834C9.52736 1.56563 8.72338 2.02754 8.03675 2.42704C7.35012 2.82404 6.21656 3.4807 5.51495 3.88269C2.96069 5.34834 1.77469 6.05744 1.69978 6.15731C1.65234 6.22223 1.65234 6.28215 1.65234 8.10485C1.65234 9.9575 1.65234 9.98996 1.70478 10.1273C1.73474 10.2047 1.78468 10.2921 1.81713 10.322C1.84959 10.352 2.02687 10.4644 2.20914 10.5717C2.3939 10.6791 2.84833 10.9462 3.21786 11.166C4.80834 12.1073 5.37013 12.4219 5.45752 12.4219C5.57238 12.4219 5.83454 12.292 6.48872 11.905C6.79083 11.7278 7.12791 11.533 7.23777 11.4731C7.67971 11.2334 8.27895 10.8938 8.56109 10.724C8.72588 10.6242 9.03049 10.4444 9.23524 10.3245C9.44247 10.2047 9.78454 10.0074 9.99677 9.88259C10.209 9.76025 10.4911 9.59795 10.621 9.52554C10.7508 9.45314 11.0854 9.25339 11.3625 9.0836C11.6422 8.91382 11.9568 8.72905 12.0617 8.67163C12.2889 8.55178 12.4337 8.46938 13.6297 7.76528C14.6184 7.18351 15.2276 6.82896 15.4424 6.70911C15.6321 6.60175 15.8119 6.43696 15.8593 6.32959C15.8943 6.25219 15.8968 6.01 15.8918 4.34461C15.8893 3.0862 15.8768 2.41705 15.8593 2.35962C15.8094 2.19483 15.727 2.11743 15.4823 2.00507C15.2152 1.88273 14.2589 1.40084 13.405 0.953905C12.0242 0.237313 12.189 0.312218 12.0017 0.314714C11.9068 0.314714 11.787 0.329696 11.7321 0.347174Z" fill="#0C0D0E"/>
            <path d="M15.4773 2.71667C15.4873 2.74913 15.4948 3.53813 15.4973 4.46695L15.5023 6.15981L15.4324 6.21973C15.3475 6.29214 13.3525 7.48064 11.9443 8.2946C11.7321 8.41695 10.8782 8.91632 10.0467 9.4007C9.21526 9.88509 8.27146 10.4344 7.94936 10.6242C6.99807 11.1785 5.74216 11.8876 5.65477 11.9175L5.57737 11.945L5.58236 10.2172C5.58985 8.54678 5.59235 8.48686 5.63979 8.38948C5.69722 8.27463 5.84453 8.17975 7.06299 7.47814C8.34886 6.73658 8.73087 6.51686 9.03549 6.33708C9.20028 6.23971 9.75208 5.92011 10.2589 5.62798C10.7683 5.33585 11.2851 5.03623 11.4075 4.96133C11.5323 4.88642 11.812 4.72413 12.0317 4.59929C12.2514 4.47694 12.7008 4.21727 13.0304 4.02501C14.7458 3.02378 15.0903 2.81904 15.2152 2.74414C15.3775 2.64177 15.4574 2.63428 15.4773 2.71667Z" fill="#F1F3F3"/>
            <path d="M14.9904 7.66155C14.9155 7.69401 14.7083 7.81136 14.5285 7.92122C14.3513 8.03358 13.9617 8.26079 13.6671 8.42808C13.3725 8.59786 12.9056 8.86752 12.6309 9.02732C12.3563 9.18712 11.6597 9.59161 11.0829 9.92618C10.5061 10.2583 10.0018 10.5629 9.96431 10.5978C9.92436 10.6328 9.86693 10.7077 9.83947 10.7626C9.78953 10.855 9.78454 10.9049 9.77705 11.4043C9.77205 11.7713 9.75957 11.9486 9.74209 11.9486C9.72711 11.9486 9.58978 11.8762 9.43748 11.7888C9.028 11.5541 8.71339 11.4018 8.60353 11.3843C8.50865 11.3694 8.4712 11.3893 7.83451 11.7688C7.46498 11.9861 6.74089 12.413 6.22655 12.7176C4.67601 13.629 3.94943 14.0584 3.79213 14.1633C3.67977 14.2382 3.62734 14.2931 3.57241 14.3955L3.5 14.5328L3.51248 15.9935C3.51997 17.2819 3.52747 17.4666 3.56492 17.564C3.63233 17.7438 3.71722 17.8312 3.96191 17.9685C4.08676 18.0384 4.40635 18.2232 4.66602 18.378C4.92819 18.5328 5.27026 18.7325 5.42756 18.8224C5.58486 18.9098 5.93442 19.1145 6.20158 19.2768C6.46874 19.4366 6.74089 19.5964 6.80581 19.6289C6.93565 19.6938 7.09295 19.7063 7.22778 19.6588C7.30768 19.6314 8.52613 18.9348 9.1853 18.5403C9.36507 18.4329 9.68466 18.2481 9.89689 18.1283C10.9131 17.554 11.1253 17.4017 11.2427 17.172C11.3575 16.9473 11.37 16.8175 11.37 15.7863C11.37 15.2544 11.3775 14.82 11.39 14.82C11.4075 14.82 11.4275 14.8325 12.4961 15.4367C13.4549 15.981 13.4474 15.9785 13.6297 15.9585C13.732 15.9486 13.8494 15.9086 14.0042 15.8362C14.3063 15.6889 15.5372 14.9823 16.7133 14.2807C17.2426 13.9636 17.737 13.6714 17.8094 13.6315C18.0091 13.5266 18.2213 13.3169 18.3037 13.1521L18.3737 13.0098L18.3811 11.2245C18.3861 9.98111 18.3811 9.41183 18.3612 9.34442C18.3187 9.2021 18.1989 9.08475 17.9767 8.97239C17.8643 8.91746 17.4423 8.69524 17.0378 8.47802C16.6334 8.26329 16.089 7.97615 15.8319 7.84382C15.3025 7.57416 15.2376 7.55918 14.9904 7.66155Z" fill="#0C0D0E"/>
            <path d="M17.9792 9.5941C17.9916 9.61907 17.9991 10.3756 17.9991 11.2745C17.9991 12.86 17.9966 12.9124 17.9492 13.0098C17.9042 13.0997 17.8293 13.1521 17.2251 13.5166C16.104 14.1933 14.144 15.3293 13.8269 15.4891C13.7445 15.5291 13.6496 15.569 13.6097 15.579C13.5323 15.5965 13.4074 15.5441 13.385 15.4816C13.375 15.4617 13.3675 14.7551 13.3675 13.9111C13.3625 12.2233 13.36 12.2682 13.5148 12.1534C13.6247 12.0735 14.4486 11.5741 15.0279 11.237C15.9018 10.7302 16.2588 10.5179 16.7133 10.2358C17.8268 9.54916 17.9342 9.49423 17.9792 9.5941Z" fill="#F1F3F3"/>
            <path d="M10.973 13.6864C10.9955 13.7813 10.9955 15.167 10.9755 16.1059L10.9581 16.8549L10.8906 16.9698C10.8457 17.0472 10.7658 17.1246 10.641 17.2095C10.3064 17.4392 7.64475 19.0047 7.22528 19.2219C7.10793 19.2793 7.02054 19.3118 6.99307 19.2993C6.95312 19.2843 6.95063 19.177 6.95063 17.6938C6.95063 16.7251 6.96062 16.0709 6.9756 16.016C6.98808 15.9685 7.03302 15.8986 7.07048 15.8612C7.15037 15.7863 7.53489 15.5441 8.28144 15.0996C9.16532 14.5778 10.2764 13.9086 10.5685 13.7264C10.8282 13.5641 10.8607 13.5491 10.9056 13.5816C10.9356 13.599 10.9655 13.6465 10.973 13.6864Z" fill="#F1F3F3"/>
          </g>
          <defs>
            <clipPath id="clip0_wf_cl">
              <rect width="20" height="20" fill="white"/>
            </clipPath>
          </defs>
        </svg>
        <div>
          <p className="font-bold text-sm tracking-tight text-gray-900">Copy Library</p>
          <p className="text-xs mt-0" style={{ color: "#A8A69F" }}>Workflows.io</p>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pt-5 pb-1">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Categories</p>
      </div>
      <div className="px-2 pb-3 space-y-0.5">
        {CATEGORY_NAV.map((item) => {
          if (!("children" in item)) {
            const count = countForKey(item.key);
            const active = activeView.type === "category" && activeView.key === item.key;
            return (
              <button key={item.key}
                onClick={() => { setActiveView({ type: "category", key: item.key }); setActiveCampaign(null); }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2 hover:bg-gray-100 hover:text-gray-900"
                style={active ? { background: P.chipActive, color: P.chipTextActive } : { color: P.muted }}>
                <span className="flex items-center gap-2">
                  <span style={{ color: active ? "#fff" : P.chipText }}>{item.icon}</span>
                  {item.label}
                </span>
                {count > 0 && (
                  <span className="text-xs rounded-full px-1.5 py-0.5 font-medium flex-shrink-0"
                    style={active ? { background: "#3d3d3f", color: "#fff" } : { background: P.chip, color: P.chipText }}>
                    {count}
                  </span>
                )}
              </button>
            );
          }

          const group = item as NavGroup;
          const expanded = expandedGroups.has(group.key);
          const groupCount = countForGroup(group.key);
          return (
            <div key={group.key}>
              <button onClick={() => toggleGroup(group.key)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2 hover:bg-gray-100 hover:text-gray-900"
                style={{ color: "#374151" }}>
                <span className="flex items-center gap-2">
                  <span style={{ color: "#9ca3af" }}>{group.icon}</span>
                  {group.label}
                </span>
                <span className="flex items-center gap-1.5">
                  {groupCount > 0 && (
                    <span className="text-xs rounded-full px-1.5 py-0.5 font-medium flex-shrink-0"
                      style={{ background: "#f3f4f6", color: "#9ca3af" }}>{groupCount}</span>
                  )}
                  {expanded
                    ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                </span>
              </button>
              {expanded && (
                <div className="ml-3 space-y-0.5 mt-0.5">
                  {group.children.map((child) => {
                    const count = countForKey(child.key);
                    const active = activeView.type === "category" && activeView.key === child.key;
                    return (
                      <button key={child.key}
                        onClick={() => { setActiveView({ type: "category", key: child.key }); setActiveCampaign(null); }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 hover:bg-gray-100 hover:text-gray-900"
                        style={active ? { background: P.chipActive, color: P.chipTextActive } : { color: P.muted }}>
                        <span className="flex items-center gap-2">
                          <span style={{ color: active ? "#fff" : P.chipText }}>{child.icon}</span>
                          {child.label}
                        </span>
                        {count > 0 && (
                          <span className="text-xs rounded-full px-1.5 py-0.5 font-medium flex-shrink-0"
                            style={active ? { background: "#3d3d3f", color: "#fff" } : { background: P.chip, color: P.chipText }}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-4 my-1" style={{ borderTop: `1px solid ${P.border}` }} />

      {/* Clients */}
      <div className="px-2 pb-3">
        <button onClick={() => toggleGroup("clients")}
          className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2 hover:bg-gray-100 hover:text-gray-900"
          style={{ color: "#374151" }}>
          <span className="flex items-center gap-2">
            <span style={{ color: "#9ca3af" }}><Users className="w-3.5 h-3.5" /></span>
            Clients
          </span>
          <span className="flex items-center gap-1.5">
            {clients.length > 0 && (
              <span className="text-xs rounded-full px-1.5 py-0.5 font-medium"
                style={{ background: "#f3f4f6", color: "#9ca3af" }}>{clients.length}</span>
            )}
            {expandedGroups.has("clients")
              ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
          </span>
        </button>
        {expandedGroups.has("clients") && (
          <div className="ml-3 mt-0.5 space-y-0.5">
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
              </div>
            ) : (
              clients.map((client) => {
                const active = activeView.type === "client" && activeView.clientId === client.id;
                return (
                  <button key={client.id}
                    onClick={() => { setActiveView({ type: "client", clientId: client.id }); setActiveCampaign(null); }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 hover:bg-gray-100 hover:text-gray-900"
                    style={active ? { background: P.chipActive, color: P.chipTextActive } : { color: P.muted }}>
                    <span className="truncate">{client.name}</span>
                    <span className="text-xs rounded-full px-1.5 py-0.5 font-medium flex-shrink-0"
                      style={active ? { background: "#3d3d3f", color: "#fff" } : { background: P.chip, color: P.chipText }}>
                      {client.campaigns.length}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="mt-auto px-2 pb-4 space-y-0.5" style={{ borderTop: `1px solid ${P.border}`, paddingTop: 8 }}>
        <button onClick={() => router.push("/account")}
          className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 hover:bg-gray-100 hover:text-gray-900"
          style={{ color: "#6b7280" }}>
          <BookOpen className="w-3.5 h-3.5" style={{ color: "#9ca3af" }} />
          My Sequences
        </button>
        {role === "admin" && (
          <button onClick={() => router.push("/admin")}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 hover:bg-gray-100 hover:text-gray-900"
            style={{ color: "#6b7280" }}>
            <Users className="w-3.5 h-3.5" style={{ color: "#9ca3af" }} />
            Admin
          </button>
        )}
        {session?.user && (
          <div className="px-3 py-2 flex items-center gap-2">
            <Link href="/settings"
              className="flex items-center gap-2 flex-1 min-w-0 rounded-lg px-1 py-1 transition-colors hover:bg-gray-50 group">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: P.primarySolid }}>
                {session.user.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <p className="text-xs font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                {session.user.name}
              </p>
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── Campaign detail ───────────────────────────────────────────────────────

  const [metaDecisionMakers, setMetaDecisionMakers] = useState("");
  const [metaAngle, setMetaAngle] = useState("");
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);
  const [metaRecordId, setMetaRecordId] = useState<string | null>(null);

  function onSelectCampaign(c: CopyCampaign) {
    setActiveCampaign(c);
    setMetaDecisionMakers(c.decisionMakers ?? "");
    setMetaAngle(c.angle ?? "");
    setMetaRecordId(c.masterRecordId ?? null);
    setMetaSaved(false);
    setSeqOpen(true);
  }

  async function saveMeta() {
    if (!activeCampaign) return;
    setMetaSaving(true);
    try {
      const res = await fetch("/api/campaigns/meta", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterRecordId: metaRecordId,
          campaignName: activeCampaign.name,
          decisionMakers: metaDecisionMakers,
          angle: metaAngle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (!metaRecordId && data.recordId) setMetaRecordId(data.recordId);
        setMetaSaved(true);
        setTimeout(() => setMetaSaved(false), 2000);
      }
    } finally {
      setMetaSaving(false);
    }
  }

  if (activeCampaign) {
    const step = getActiveStep(activeCampaign);
    const isLinkedIn = activeCampaign.channel === "LinkedIn";
    const backLabel = activeView.type === "client"
      ? clients.find((c) => c.id === activeView.clientId)?.name ?? "Back"
      : labelForKey(activeView.key);
    const activeClient = clients.find((c) => {
      const cBase = c.name.split(" - ")[0].trim().toLowerCase();
      const aBase = activeCampaign.client.split(" - ")[0].trim().toLowerCase();
      return cBase === aBase;
    });

    return (
      <>
      <style>{`@keyframes seq-border-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }`}</style>
      <div className="flex h-screen overflow-hidden" style={{ background: P.bg }}>
        {sidebar}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">
            <div className="flex justify-end mb-4">
              <div style={{ position: "relative", borderRadius: 12, padding: 2, overflow: "hidden", display: "inline-flex" }}>
                {!seqOpen && (
                  <div style={{
                    position: "absolute", width: "200%", height: "400%",
                    top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    background: "conic-gradient(from 0deg, transparent 0deg, transparent 320deg, #9ca3af 345deg, #1c1c1e 355deg, transparent 360deg)",
                    animation: "seq-border-spin 2.5s linear infinite",
                  }} />
                )}
                <button onClick={() => setSeqOpen((v) => !v)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold"
                  style={{ background: seqOpen ? P.primary : P.chip, color: seqOpen ? "#fff" : P.text, zIndex: 1 }}>
                  <PenLine className="w-4 h-4" /> Sequence Writer
                </button>
              </div>
            </div>
            <button onClick={() => setActiveCampaign(null)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to {backLabel}
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{activeCampaign.name}</h1>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: P.chip, color: P.subtext }}>
                  {isLinkedIn ? <Linkedin className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                  {activeCampaign.channel}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "#f3f4f6", color: "#6b7280" }}>
                  {labelForKey(categoryKeyOf(activeCampaign))}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{activeCampaign.client}</p>
              <div className="rounded-2xl p-4 mb-2" style={{ background: "#f9fafb", border: `1px solid ${P.border}` }}>
                {/* Performance row */}
                <div className="flex gap-4 mb-3 pb-3" style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>Reply Rate</p>
                    <p className="text-sm font-semibold" style={{ color: activeCampaign.replyRate ? P.text : "#9ca3af" }}>
                      {activeCampaign.replyRate !== null ? `${activeCampaign.replyRate}%` : "—"}
                    </p>
                  </div>
                  <div className="w-px self-stretch" style={{ background: "#e5e7eb" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>Positive Reply Rate</p>
                    <p className="text-sm font-semibold" style={{ color: activeCampaign.positiveReplyRate ? "#16a34a" : "#9ca3af" }}>
                      {activeCampaign.positiveReplyRate !== null ? `${activeCampaign.positiveReplyRate}%` : "—"}
                    </p>
                  </div>
                  <div className="w-px self-stretch" style={{ background: "#e5e7eb" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>Positive Replies</p>
                    <p className="text-sm font-semibold" style={{ color: activeCampaign.positiveReplies > 0 ? "#16a34a" : "#9ca3af" }}>
                      {activeCampaign.positiveReplies > 0 ? activeCampaign.positiveReplies : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>Account Owner</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{activeClient?.accountOwner || "—"}</p>
                  </div>
                  <div className="w-px self-stretch" style={{ background: "#e5e7eb" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>Account Manager</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{activeClient?.accountManager || "—"}</p>
                  </div>
                </div>
                {activeClient?.accountDescription && (
                  <>
                    <div className="mb-3" style={{ borderTop: "1px solid #e5e7eb" }} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>About</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{activeClient.accountDescription}</p>
                    </div>
                  </>
                )}
                {/* Editable meta fields */}
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <div className="flex gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#94a3b8" }}>Decision Makers</label>
                      <input
                        type="text"
                        placeholder="e.g. VP of Sales, Head of Growth, CRO"
                        value={metaDecisionMakers}
                        onChange={(e) => { setMetaDecisionMakers(e.target.value); setMetaSaved(false); }}
                        className="w-full text-sm text-gray-800 rounded-xl px-3 py-2 outline-none transition-all"
                        style={{ border: "1.5px solid #e5e7eb", background: "#fff" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#94a3b8" }}>Angle</label>
                      <input
                        type="text"
                        placeholder="e.g. Pain-based, ROI, Competitor switch"
                        value={metaAngle}
                        onChange={(e) => { setMetaAngle(e.target.value); setMetaSaved(false); }}
                        className="w-full text-sm text-gray-800 rounded-xl px-3 py-2 outline-none transition-all"
                        style={{ border: "1.5px solid #e5e7eb", background: "#fff" }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={saveMeta}
                      disabled={metaSaving}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: metaSaved ? "#f0fdf4" : P.primarySolid, color: metaSaved ? "#16a34a" : "#fff" }}>
                      {metaSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : metaSaved ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                      {metaSaving ? "Saving…" : metaSaved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {activeCampaign.steps.map((s) => (
                <button key={s.id}
                  onClick={() => setActiveStepId((prev) => ({ ...prev, [activeCampaign.id]: s.id }))}
                  className="text-sm px-4 py-2 rounded-xl font-medium transition-all"
                  style={step.id === s.id
                    ? { background: "#CCFF00", color: "#111" }
                    : { background: "#fff", color: "#6b7280", border: "1px solid #e5e7eb" }}>
                  {s.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#fff", border: "1.5px solid #f0f0f0", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
              {step.subject && (
                <div className="flex items-center gap-3 px-6 py-3"
                  style={{ borderBottom: `1px solid ${P.border}`, background: "#fafafa" }}>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Subject</span>
                  <span className="text-sm font-medium text-gray-800">{step.subject}</span>
                </div>
              )}
              <div className="relative px-6 py-6">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed pr-20">{step.body}</pre>
                <button
                  onClick={() => copyText(step.subject ? `Subject: ${step.subject}\n\n${step.body}` : step.body, step.id)}
                  className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={copied === step.id
                    ? { background: "#CCFF00", color: "#111" }
                    : { background: "#f5f5f5", color: "#6b7280" }}>
                  {copied === step.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: "1px solid #f5f5f5" }}>
                <div className="flex items-center gap-1.5">
                  {step.channel === "linkedin"
                    ? <Linkedin className="w-3.5 h-3.5" style={{ color: "#0A66C2" }} />
                    : <Mail className="w-3.5 h-3.5 text-gray-300" />}
                  <span className="text-xs text-gray-400 capitalize">{step.channel}</span>
                </div>
                <button onClick={() => loadCampaignIntoWriter(activeCampaign)}
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: P.text }}>
                  <PenLine className="w-3.5 h-3.5" /> Edit in Sequence Writer
                </button>
              </div>
            </div>
          </div>
        </div>
        <SequenceWriterPanel
          open={seqOpen} onClose={() => setSeqOpen(false)}
          steps={seqSteps} setSteps={setSeqSteps}
          activeStep={activeSeqStep} setActiveStep={setActiveSeqStep}
          clients={clients}
        />
      </div>
      </>
    );
  }

  // ── Grid view ─────────────────────────────────────────────────────────────

  const viewCampaigns = getViewCampaigns();
  const viewTitle = activeView.type === "client"
    ? clients.find((c) => c.id === activeView.clientId)?.name ?? "Client"
    : labelForKey(activeView.key);

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        {sidebar}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Loading & classifying campaigns…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden">
        {sidebar}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <style>{`@keyframes seq-border-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }`}</style>
    <div className="flex h-screen overflow-hidden" style={{ background: P.bg }}>
      {sidebar}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{viewTitle}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {viewCampaigns.length} campaign{viewCampaigns.length !== 1 ? "s" : ""}
                {viewCampaigns.length > 0 ? " · sorted by performance" : ""}
              </p>
            </div>
            <div style={{ position: "relative", borderRadius: 12, padding: 2, overflow: "hidden", display: "inline-flex", flexShrink: 0 }}>
              {!seqOpen && (
                <div style={{
                  position: "absolute", width: "200%", height: "400%",
                  top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  background: "conic-gradient(from 0deg, transparent 0deg, transparent 320deg, #9ca3af 345deg, #1c1c1e 355deg, transparent 360deg)",
                  animation: "seq-border-spin 2.5s linear infinite",
                }} />
              )}
              <button onClick={() => setSeqOpen((v) => !v)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold"
                style={{ background: seqOpen ? P.primary : P.chip, color: seqOpen ? "#fff" : P.text, zIndex: 1 }}>
                <PenLine className="w-4 h-4" /> Sequence Writer
              </button>
            </div>
          </div>

          {viewCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <p className="text-sm">No campaigns in this category yet.</p>
            </div>
          ) : activeView.type === "category" ? (
            <ClientSections campaigns={viewCampaigns} allClients={clients} onSelect={onSelectCampaign} />
          ) : (
            <ChannelGrid campaigns={viewCampaigns} onSelect={onSelectCampaign} />
          )}
        </div>
      </div>
      <SequenceWriterPanel
        open={seqOpen} onClose={() => setSeqOpen(false)}
        steps={seqSteps} setSteps={setSeqSteps}
        activeStep={activeSeqStep} setActiveStep={setActiveSeqStep}
        clients={clients}
      />
    </div>
    </>
  );
}
