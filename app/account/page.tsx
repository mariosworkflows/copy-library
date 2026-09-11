"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Mail, Linkedin, PenLine, Trash2, Loader2, Clock,
  BookOpen, Plus, Save, CheckCircle2, AlertCircle, X, Sparkles,
  ChevronDown, ChevronUp, CircleCheck, CircleAlert, CircleDot,
  Terminal, Copy as CopyIcon, ArrowRight,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "linear-gradient(135deg,#1c1c1e 0%,#2d2d30 100%)",
  primaryHover: "linear-gradient(135deg,#2d2d30 0%,#404043 100%)",
  primaryText: "#fff",
  surface: "#fff",
  bg: "#F5F4F0",
  border: "#E8E7E3",
  borderFocus: "#6b7280",
  muted: "#8B8A86",
  label: "#A8A69F",
  text: "#1C1B18",
  subtext: "#6B6860",
};

type SeqStep = { channel: "email" | "linkedin"; subject: string; body: string };
type Sequence = {
  id: string; title: string; client: string; category: string;
  steps: SeqStep[]; createdAt: string; updatedAt: string; status: string;
  decisionMakers?: string; angle?: string;
};

function uid() { return Math.random().toString(36).slice(2); }

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 animate-pulse"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="h-4 rounded-lg w-2/3" style={{ background: "#EEEDEA" }} />
      <div className="h-3 rounded-lg w-1/3" style={{ background: "#F2F1EE" }} />
      <div className="flex gap-2 mt-1">
        <div className="h-5 w-16 rounded-full" style={{ background: "#F2F1EE" }} />
        <div className="h-5 w-12 rounded-full" style={{ background: "#F2F1EE" }} />
      </div>
    </div>
  );
}

// ── Sequence Card ─────────────────────────────────────────────────────────────

function parsePlayType(title: string) {
  const slash = title.indexOf("/");
  return slash > -1 ? title.slice(0, slash) : title;
}

function SequenceCard({ seq, onOpen, onDelete, index }: {
  seq: Sequence; onOpen: () => void; onDelete: (id: string) => void; index: number;
}) {
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hasEmail = seq.steps.some((s) => s.channel === "email");
  const hasLinkedIn = seq.steps.some((s) => s.channel === "linkedin");
  const playType = parsePlayType(seq.title);
  const nameSuffix = seq.title.includes("/") ? seq.title.slice(seq.title.indexOf("/") + 1) : "";

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${seq.title}"?`)) return;
    setDeleting(true);
    await fetch(`/api/sequences/${seq.id}`, { method: "DELETE" });
    onDelete(seq.id);
  }

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left rounded-2xl w-full relative group overflow-hidden"
      style={{
        background: C.surface,
        border: `1px solid ${hovered ? "#C5C3BD" : C.border}`,
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        animation: `cardIn 0.4s cubic-bezier(0.4,0,0.2,1) ${index * 60}ms both`,
      }}
    >
      {/* Top accent strip */}
      <div style={{
        height: 3, width: "100%",
        background: hovered ? "linear-gradient(90deg,#1c1c1e,#6b7280)" : C.border,
        transition: "background 0.3s",
      }} />

      <div className="p-5 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: C.label }}>{playType}</p>
            <p className="text-sm font-bold truncate" style={{ color: C.text }}>
              {nameSuffix || seq.client || "Untitled"}
            </p>
            {seq.client && nameSuffix && (
              <p className="text-xs mt-0.5 truncate" style={{ color: C.subtext }}>{seq.client}</p>
            )}
          </div>
          <button
            onClick={handleDelete} disabled={deleting}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            style={{ color: "#9CA39A" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626", e.currentTarget.style.background = "#fef2f2")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA39A", e.currentTarget.style.background = "transparent")}
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Meta tags */}
        {(seq.decisionMakers || seq.angle) && (
          <div className="flex flex-wrap gap-1.5">
            {seq.decisionMakers && (
              <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: "#F2F1EE", color: C.subtext }}>
                {seq.decisionMakers}
              </span>
            )}
            {seq.angle && (
              <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: "#F2F1EE", color: C.subtext }}>
                {seq.angle}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            {hasEmail && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium"
                style={{ background: "#F2F1EE", color: C.subtext }}>
                <Mail className="w-3 h-3" /> Email
              </span>
            )}
            {hasLinkedIn && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium"
                style={{ background: "#F2F1EE", color: C.subtext }}>
                <Linkedin className="w-3 h-3" /> LinkedIn
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: C.label }}>{formatDate(seq.updatedAt || seq.createdAt)}</span>
            <span className="text-xs font-semibold" style={{ color: hovered ? C.text : C.label, transition: "color 0.2s" }}>
              {seq.steps.length}s →
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Grammar types ─────────────────────────────────────────────────────────────

type GrammarIssue = { type: string; original: string; suggestion: string; explanation: string };
type GrammarResult = {
  score: "clean" | "minor" | "needs_work";
  summary: string; issues: GrammarIssue[];
  correctedBody: string; correctedSubject: string | null;
};
const SCORE_META = {
  clean:      { label: "Clean",        color: "#16a34a", bg: "#f0fdf4", icon: CircleCheck },
  minor:      { label: "Minor issues", color: "#b45309", bg: "#fffbeb", icon: CircleDot },
  needs_work: { label: "Needs work",   color: "#dc2626", bg: "#fef2f2", icon: CircleAlert },
};

// ── Input helper ──────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, full = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; full?: boolean;
}) {
  return (
    <div className={full ? "w-full" : "flex-1"}>
      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: C.label }}>
        {label}
      </label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: "#FAFAF8", border: `1.5px solid ${C.border}`,
          color: C.text, transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = C.borderFocus)}
        onBlur={(e) => (e.target.style.borderColor = C.border)}
      />
    </div>
  );
}

// ── Sequence Editor ───────────────────────────────────────────────────────────

function SequenceEditor({ seq, onBack, onSaved }: {
  seq: Sequence; onBack: () => void; onSaved: (updated: Sequence) => void;
}) {
  const SEQ_TYPES = [
    "Ad Engagement","Brand Mentions","Closed Lost Reopens","Cold Audience","Cold Campaign",
    "Competitor Brand Mentions","Connections of Founders / C-Levels","Customer Alumni",
    "Downloaded a Lead Magnet","Event",
    "Followers of Competitors Company's Page on LinkedIn",
    "Followers of Your Company's Page on LinkedIn",
    "G2 Profile Visits","Glassdoor Reviews","Google Reviews","Hiring / Open Jobs",
    "Influencers Content Engagement","Integration Overlap","Job Changes of Champions",
    "LinkedIn Connections of Your Competitors","LinkedIn Engagement","LinkedIn Profile Visitors",
    "Multi-Thread Inbound Requests","Mutual VC Portfolio Companies","New ICP Hires",
    "Newsletter Subscribers","Raised New Funding Round","Searching for a Specific Keyword",
    "Specific Post Scraping","Upcoming Event Attendees","Using Specific Tech","Website Visitors",
    "Yours / C-Suite / Advisors LinkedIn Network",
  ];

  function parseTitle(t: string) {
    const match = SEQ_TYPES.find((tp) => t.startsWith(`${tp}/`));
    return match ? { type: match, suffix: t.slice(match.length + 1) } : { type: "Cold Campaign", suffix: t };
  }

  const parsed = parseTitle(seq.title);
  const [seqType, setSeqType] = useState(parsed.type);
  const [seqSuffix, setSeqSuffix] = useState(parsed.suffix);
  const title = seqSuffix.trim() ? `${seqType}/${seqSuffix.trim()}` : seqType;
  const [client, setClient] = useState(seq.client);
  const [category] = useState(seq.category);
  const [decisionMakers, setDecisionMakers] = useState(seq.decisionMakers ?? "");
  const [angle, setAngle] = useState(seq.angle ?? "");
  const [steps, setSteps] = useState<(SeqStep & { _id: string })[]>(
    seq.steps.map((s) => ({ ...s, _id: uid() }))
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarResult, setGrammarResult] = useState<GrammarResult | null>(null);
  const [grammarOpen, setGrammarOpen] = useState(false);
  const [showCorrected, setShowCorrected] = useState(false);
  const [claudePromptLoading, setClaudePromptLoading] = useState(false);
  const [claudePrompt, setClaudePrompt] = useState<string | null>(null);
  const [claudePromptOpen, setClaudePromptOpen] = useState(false);
  const [claudePromptCopied, setClaudePromptCopied] = useState(false);

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const btn = tabs.querySelectorAll<HTMLButtonElement>("[data-tab]")[activeIdx];
    if (btn) setIndicatorStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [activeIdx, steps.length]);

  function addStep() {
    const last = steps[steps.length - 1]?.channel ?? "email";
    setSteps((p) => [...p, { _id: uid(), channel: last, subject: "", body: "" }]);
    setTimeout(() => setActiveIdx(steps.length), 0);
  }

  function removeStep(i: number) {
    if (steps.length === 1) return;
    setSteps((p) => p.filter((_, idx) => idx !== i));
    setActiveIdx((p) => Math.max(0, p >= steps.length - 1 ? steps.length - 2 : p));
  }

  function updateStep(i: number, patch: Partial<SeqStep>) {
    setSteps((p) => p.map((s, idx) => idx === i ? { ...s, ...patch } : s));
    if (patch.body !== undefined || patch.subject !== undefined) {
      setGrammarResult(null); setGrammarOpen(false);
    }
  }

  async function checkGrammar() {
    if (!current?.body.trim()) return;
    setGrammarLoading(true); setGrammarResult(null);
    setGrammarOpen(true); setShowCorrected(false);
    try {
      const res = await fetch("/api/ai/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: current.channel === "email" ? current.subject : undefined, body: current.body, channel: current.channel }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "API error");
      setGrammarResult(data);
    } catch (err) {
      setGrammarResult({ score: "needs_work", summary: `Error: ${err instanceof Error ? err.message : "Try again."}`, issues: [{ type: "Error", original: "", suggestion: "", explanation: "The grammar check failed." }], correctedBody: "", correctedSubject: null });
    } finally { setGrammarLoading(false); }
  }

  async function generateClaudePrompt() {
    setClaudePromptLoading(true); setClaudePrompt(null);
    setClaudePromptOpen(true); setClaudePromptCopied(false);
    try {
      const res = await fetch("/api/ai/claude-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, client, category, decisionMakers, angle, steps: steps.map(({ _id: _, ...rest }) => rest) }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Generation failed");
      setClaudePrompt(data.prompt);
    } catch (err) {
      setClaudePrompt(`Error: ${err instanceof Error ? err.message : "Could not generate. Try again."}`);
    } finally { setClaudePromptLoading(false); }
  }

  async function handleSave() {
    if (!title.trim()) { setSaveError("Title is required."); return; }
    setSaveError(""); setSaving(true);
    try {
      const res = await fetch(`/api/sequences/${seq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), client, category, decisionMakers, angle, steps: steps.map(({ _id: _, ...rest }) => rest) }),
      });
      if (!res.ok) throw new Error("Failed");
      setSaveState("saved");
      onSaved({ ...seq, title: title.trim(), client, category, decisionMakers, angle, steps: steps.map(({ _id: _, ...rest }) => rest), updatedAt: new Date().toISOString() });
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveError("Failed to save. Try again."); setSaveState("error");
      setTimeout(() => { setSaveState("idle"); setSaveError(""); }, 3000);
    } finally { setSaving(false); }
  }

  const current = steps[activeIdx];
  const wordCount = current?.body.trim().split(/\s+/).filter(Boolean).length ?? 0;
  const inputBase: React.CSSProperties = { background: "#FAFAF8", border: `1.5px solid ${C.border}`, color: C.text, transition: "border-color 0.15s" };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8" style={{ animation: "fadeSlideUp 0.3s cubic-bezier(0.4,0,0.2,1) both" }}>
      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: C.muted }}
        onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
        onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}>
        <ArrowLeft className="w-4 h-4" /> My Sequences
      </button>

      {/* Metadata card */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        {/* Play type + name row */}
        <div className="flex items-center gap-3 mb-5">
          <select value={seqType} onChange={(e) => setSeqType(e.target.value)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold outline-none"
            style={{ background: "#F2F1EE", border: `1px solid ${C.border}`, color: C.subtext, cursor: "pointer" }}>
            {SEQ_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="text" value={seqSuffix} onChange={(e) => setSeqSuffix(e.target.value)}
            placeholder="Sequence name…"
            className="flex-1 text-xl font-bold outline-none bg-transparent"
            style={{ color: C.text, borderBottom: `2px solid transparent`, transition: "border-color 0.2s" }}
            onFocus={(e) => (e.target.style.borderBottomColor = C.borderFocus)}
            onBlur={(e) => (e.target.style.borderBottomColor = "transparent")}
          />
        </div>

        {/* Fields grid */}
        <div className="space-y-3">
          <Field label="Client" value={client} onChange={setClient} placeholder="e.g. Blotout" full />
          <div className="flex gap-3">
            <Field label="Decision Makers" value={decisionMakers} onChange={setDecisionMakers} placeholder="e.g. VP of Sales, Head of Growth, CRO" />
            <Field label="Angle" value={angle} onChange={setAngle} placeholder="e.g. Pain-based, ROI, Competitor switch" />
          </div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex items-center gap-2 mb-4">
        <div ref={tabsRef} className="relative flex items-center gap-1 p-1 rounded-xl flex-1 flex-wrap"
          style={{ background: "#EEEDEA" }}>
          <div style={{
            position: "absolute", top: 4, height: "calc(100% - 8px)",
            left: indicatorStyle.left + 4, width: indicatorStyle.width - 8,
            background: C.text, borderRadius: 10,
            transition: "left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1)",
            pointerEvents: "none",
          }} />
          {steps.map((step, i) => (
            <button key={step._id} data-tab onClick={() => setActiveIdx(i)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold z-10 transition-colors"
              style={{ color: activeIdx === i ? "#fff" : C.muted }}>
              {step.channel === "linkedin" ? <Linkedin className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
              Step {i + 1}
              {steps.length > 1 && (
                <span onClick={(e) => { e.stopPropagation(); removeStep(i); }}
                  className="ml-0.5 hover:opacity-80 transition-opacity"
                  style={{ color: activeIdx === i ? "rgba(255,255,255,0.6)" : "#9CA39A" }}>
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>
          ))}
        </div>
        <button onClick={addStep}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
          style={{ background: C.surface, color: C.muted, border: `1px solid ${C.border}` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9CA39A"; e.currentTarget.style.color = C.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
          <Plus className="w-3.5 h-3.5" /> Add step
        </button>
      </div>

      {/* Step editor */}
      {current && (
        <div className="rounded-2xl overflow-hidden" key={current._id}
          style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", animation: "fadeIn 0.2s ease both" }}>
          {/* Channel toggle */}
          <div className="flex" style={{ borderBottom: `1px solid ${C.border}` }}>
            {(["email", "linkedin"] as const).map((ch) => (
              <button key={ch} onClick={() => updateStep(activeIdx, { channel: ch })}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all"
                style={{
                  color: current.channel === ch ? C.text : C.muted,
                  borderBottom: current.channel === ch ? `2px solid ${C.text}` : "2px solid transparent",
                  background: current.channel === ch ? "#FAFAF8" : "transparent",
                }}>
                {ch === "email" ? <Mail className="w-4 h-4" /> : <Linkedin className="w-4 h-4" />}
                {ch === "email" ? "Email" : "LinkedIn"}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4">
            {current.channel === "email" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.label }}>Subject</label>
                <input type="text" value={current.subject}
                  onChange={(e) => updateStep(activeIdx, { subject: e.target.value })}
                  placeholder="Subject line…"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = C.borderFocus)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.label }}>Message</label>
              <textarea value={current.body}
                onChange={(e) => updateStep(activeIdx, { body: e.target.value })}
                placeholder={current.channel === "linkedin" ? "LinkedIn message…" : "Email body…"}
                rows={14}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none leading-relaxed"
                style={inputBase}
                onFocus={(e) => (e.target.style.borderColor = C.borderFocus)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs flex-shrink-0" style={{ color: C.label }}>{wordCount} word{wordCount !== 1 ? "s" : ""}</p>
              <div className="flex items-center gap-2">
                <button onClick={checkGrammar} disabled={grammarLoading || !current?.body.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all"
                  style={{
                    background: grammarResult ? SCORE_META[grammarResult.score].bg : "#F2F1EE",
                    color: grammarResult ? SCORE_META[grammarResult.score].color : C.subtext,
                    border: `1px solid ${grammarResult ? SCORE_META[grammarResult.score].color + "33" : C.border}`,
                  }}>
                  {grammarLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking…</> : <><Sparkles className="w-3.5 h-3.5" /> {grammarResult ? "Re-check grammar" : "Check grammar"}</>}
                </button>
                <button
                  disabled
                  title="Coming soon — powered by deep copy knowledge"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold opacity-50 cursor-not-allowed"
                  style={{ background: "#fdf4ff", color: "#9333ea", border: "1px solid #e9d5ff" }}>
                  <BookOpen className="w-3.5 h-3.5" /> Copy Auditor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grammar results */}
      {grammarOpen && (
        <div className="mt-4 rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${grammarResult ? SCORE_META[grammarResult.score].color + "40" : C.border}`, animation: "fadeSlideUp 0.25s ease both" }}>
          <div className="flex items-center justify-between px-5 py-3.5"
            style={{ background: grammarResult ? SCORE_META[grammarResult.score].bg : "#FAFAF8", borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4" style={{ color: grammarResult ? SCORE_META[grammarResult.score].color : C.subtext }} />
              <span className="text-sm font-bold" style={{ color: grammarResult ? SCORE_META[grammarResult.score].color : C.subtext }}>Grammar Check</span>
              {grammarResult && (() => { const m = SCORE_META[grammarResult.score]; const Icon = m.icon; return (
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: m.color + "18", color: m.color }}>
                  <Icon className="w-3.5 h-3.5" /> {m.label}
                </span>
              ); })()}
            </div>
            <button onClick={() => setGrammarOpen(false)} style={{ color: C.muted }} className="hover:text-gray-700 transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="bg-white px-5 py-4 space-y-4">
            {grammarLoading && (
              <div className="flex items-center gap-3 py-6 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.subtext }} />
                <span className="text-sm text-gray-500">Analysing your copy…</span>
              </div>
            )}
            {grammarResult && !grammarLoading && (
              <>
                <p className="text-sm text-gray-700 leading-relaxed">{grammarResult.summary}</p>
                {grammarResult.issues.length > 0 && (
                  <div className="space-y-3">
                    {grammarResult.issues.map((issue, i) => (
                      <div key={i} className="rounded-xl p-4" style={{ background: "#FAFAF8", border: `1px solid ${C.border}`, animation: `cardIn 0.3s ease ${i * 50}ms both` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#F2F1EE", color: C.subtext }}>{issue.type}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1 line-through">{issue.original}</p>
                        <p className="text-xs font-medium mb-1.5" style={{ color: C.text }}>→ {issue.suggestion}</p>
                        <p className="text-xs" style={{ color: C.muted }}>{issue.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
                {grammarResult.issues.length === 0 && (
                  <div className="flex items-center gap-2 py-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#16a34a" }} />
                    <span className="text-sm text-gray-600">No issues found. Great copy!</span>
                  </div>
                )}
                {grammarResult.correctedBody && grammarResult.score !== "clean" && (
                  <div>
                    <button onClick={() => setShowCorrected((p) => !p)}
                      className="flex items-center gap-2 text-xs font-semibold mb-3 transition-colors"
                      style={{ color: C.subtext }}>
                      {showCorrected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {showCorrected ? "Hide corrected version" : "Show corrected version"}
                    </button>
                    {showCorrected && (
                      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}`, animation: "fadeSlideUp 0.2s ease both" }}>
                        {grammarResult.correctedSubject && (
                          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}`, background: "#FAFAF8" }}>
                            <p className="text-xs mb-1" style={{ color: C.label }}>Subject</p>
                            <p className="text-sm font-medium" style={{ color: C.text }}>{grammarResult.correctedSubject}</p>
                          </div>
                        )}
                        <textarea readOnly value={grammarResult.correctedBody} rows={8}
                          className="w-full px-4 py-3 text-sm leading-relaxed resize-none outline-none"
                          style={{ background: "#fff", color: C.subtext }} />
                        <div className="px-4 py-3 flex justify-end" style={{ borderTop: `1px solid ${C.border}`, background: "#FAFAF8" }}>
                          <button
                            onClick={() => { updateStep(activeIdx, { body: grammarResult.correctedBody, ...(grammarResult.correctedSubject ? { subject: grammarResult.correctedSubject } : {}) }); setGrammarOpen(false); }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                            style={{ background: C.primary, color: C.primaryText }}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Apply corrections
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

      {/* Claude Prompt panel */}
      {claudePromptOpen && (
        <div className="mt-4 rounded-2xl overflow-hidden"
          style={{ border: `1px solid #C4B5FD`, animation: "fadeSlideUp 0.25s ease both" }}>
          <div className="flex items-center justify-between px-5 py-3.5"
            style={{ background: "linear-gradient(135deg,#faf5ff,#ede9fe)", borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4" style={{ color: "#7c3aed" }} />
              <span className="text-sm font-bold" style={{ color: "#7c3aed" }}>Claude Code Prompt</span>
              {!claudePromptLoading && claudePrompt && !claudePrompt.startsWith("Error:") && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#7c3aed18", color: "#7c3aed" }}>Ready to paste</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {claudePrompt && !claudePromptLoading && !claudePrompt.startsWith("Error:") && (
                <button onClick={() => { navigator.clipboard.writeText(claudePrompt); setClaudePromptCopied(true); setTimeout(() => setClaudePromptCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: claudePromptCopied ? "#16a34a" : "#7c3aed", color: "#fff", transition: "background 0.3s" }}>
                  {claudePromptCopied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><CopyIcon className="w-3.5 h-3.5" /> Copy prompt</>}
                </button>
              )}
              <button onClick={() => setClaudePromptOpen(false)} style={{ color: C.muted }} className="hover:text-gray-700 transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="bg-white">
            {claudePromptLoading && (
              <div className="flex items-center gap-3 py-8 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#7c3aed" }} />
                <span className="text-sm text-gray-500">Generating your Claude Code prompt…</span>
              </div>
            )}
            {claudePrompt && !claudePromptLoading && (
              <textarea readOnly value={claudePrompt} rows={16}
                className="w-full px-5 py-4 text-xs font-mono leading-relaxed resize-none outline-none"
                style={{ background: claudePrompt.startsWith("Error:") ? "#fef2f2" : "#FAFAFA", color: claudePrompt.startsWith("Error:") ? "#dc2626" : "#374151" }} />
            )}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <div style={{ minHeight: 20 }}>
          {saveError && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#dc2626", animation: "fadeIn 0.2s ease" }}>
              <AlertCircle className="w-3.5 h-3.5" /> {saveError}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={generateClaudePrompt}
            disabled={claudePromptLoading || steps.every((s) => !s.body.trim())}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
            style={{
              background: claudePromptOpen ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "#F2F1EE",
              color: claudePromptOpen ? "#fff" : "#7c3aed",
              border: `1px solid #C4B5FD`,
            }}>
            {claudePromptLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Terminal className="w-4 h-4" /> Claude prompt</>}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            style={{ background: saveState === "saved" ? "#16a34a" : C.primary, color: C.primaryText, transition: "background 0.3s, transform 0.1s", transform: saving ? "scale(0.97)" : "scale(1)" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveState === "saved" ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : saveState === "saved" ? "Saved!" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSeq, setOpenSeq] = useState<Sequence | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/sequences").then((r) => r.json()).then((d) => setSequences(d.sequences ?? [])).finally(() => setLoading(false));
    }
  }, [status, router]);

  function removeSeq(id: string) { setSequences((p) => p.filter((s) => s.id !== id)); }
  function handleSaved(updated: Sequence) {
    setSequences((p) => p.map((s) => s.id === updated.id ? updated : s));
    setOpenSeq(updated);
  }

  const isLoading = status === "loading" || loading;

  return (
    <>
      <style>{`
        @keyframes cardIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

      <div className="min-h-screen" style={{ background: C.bg }}>
        {/* Header */}
        <div className="px-8 py-4 flex items-center justify-between sticky top-0 z-10"
          style={{ background: "rgba(245,244,240,0.88)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-4">
            <button onClick={() => openSeq ? setOpenSeq(null) : router.push("/")}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: C.muted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}>
              <ArrowLeft className="w-4 h-4" />
              {openSeq ? "My Sequences" : "Back to Library"}
            </button>
            {!openSeq && (
              <>
                <div className="w-px h-4" style={{ background: C.border }} />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: C.text }}>
                    {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: C.text }}>{session?.user?.name}</span>
                  <span className="text-xs hidden sm:block" style={{ color: C.muted }}>{session?.user?.email}</span>
                </div>
              </>
            )}
            {openSeq && (
              <span className="text-sm font-semibold truncate max-w-xs" style={{ color: C.text, animation: "fadeIn 0.2s ease" }}>
                {openSeq.title}
              </span>
            )}
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs font-medium transition-colors" style={{ color: C.muted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}>
            Sign out
          </button>
        </div>

        {/* Content */}
        {openSeq ? (
          <SequenceEditor seq={openSeq} onBack={() => setOpenSeq(null)} onSaved={handleSaved} />
        ) : (
          <div className="max-w-5xl mx-auto px-8 py-10" style={{ animation: "fadeSlideUp 0.3s cubic-bezier(0.4,0,0.2,1) both" }}>
            {/* Page header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.text }}>My Sequences</h1>
                <p className="text-sm mt-1" style={{ color: C.muted }}>
                  {isLoading ? "Loading…" : `${sequences.length} sequence${sequences.length !== 1 ? "s" : ""} saved`}
                </p>
              </div>
              <button onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: C.primary, color: C.primaryText, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)"; e.currentTarget.style.transform = "none"; }}>
                <PenLine className="w-4 h-4" /> New Sequence
              </button>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : sequences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center" style={{ animation: "fadeSlideUp 0.4s ease both" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "#EEEDEA" }}>
                  <PenLine className="w-7 h-7" style={{ color: C.subtext }} />
                </div>
                <p className="text-base font-semibold mb-2" style={{ color: C.text }}>No sequences yet</p>
                <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: C.muted }}>
                  Open a campaign in the library and use the Sequence Writer to draft your first sequence.
                </p>
                <button onClick={() => router.push("/")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: C.primary, color: C.primaryText }}>
                  Go to Library <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                {sequences.map((seq, i) => (
                  <SequenceCard key={seq.id} seq={seq} index={i} onOpen={() => setOpenSeq(seq)} onDelete={removeSeq} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
