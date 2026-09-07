"use client";

import { useState, useEffect } from "react";
import { Mail, Linkedin, Copy, Check, ArrowLeft, PenLine, Plus, Trash2, X, Loader2 } from "lucide-react";
import type { CopyClient, CopyCampaign, CopyStep } from "@/app/api/campaigns/route";

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
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: "#f0f4ff", color: "#316BFF" }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: "#fff", border: "1px solid #f0f0f0" }}
    >
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={name}
        className="w-8 h-8 object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

interface SeqStep {
  id: string;
  channel: "email" | "linkedin";
  subject: string;
  body: string;
}

function uid() { return Math.random().toString(36).slice(2); }

export default function CopyLibraryPage() {
  const [clients, setClients] = useState<CopyClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<CopyCampaign | null>(null);
  const [activeStepId, setActiveStepId] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [seqOpen, setSeqOpen] = useState(false);
  const [seqSteps, setSeqSteps] = useState<SeqStep[]>([
    { id: uid(), channel: "email", subject: "", body: "" },
  ]);
  const [activeSeqStep, setActiveSeqStep] = useState(0);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data: CopyClient[]) => {
        setClients(data);
        if (data.length > 0) setActiveClientId(data[0].id);
      })
      .catch(() => setError("Failed to load campaigns"))
      .finally(() => setLoading(false));
  }, []);

  const activeClient = clients.find((c) => c.id === activeClientId) ?? null;

  function getActiveStep(campaign: CopyCampaign): CopyStep {
    const id = activeStepId[campaign.id] ?? campaign.steps[0]?.id;
    return campaign.steps.find((s) => s.id === id) ?? campaign.steps[0];
  }

  async function copyText(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  }

  function addSeqStep() {
    setSeqSteps((prev) => [...prev, { id: uid(), channel: "email", subject: "", body: "" }]);
    setActiveSeqStep(seqSteps.length);
  }

  function removeSeqStep(i: number) {
    setSeqSteps((prev) => prev.filter((_, idx) => idx !== i));
    setActiveSeqStep((prev) => Math.max(0, prev - 1));
  }

  function updateSeqStep(i: number, patch: Partial<SeqStep>) {
    setSeqSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  function loadCampaignIntoWriter(campaign: CopyCampaign) {
    const steps: SeqStep[] = campaign.steps.map((s) => ({
      id: uid(),
      channel: s.channel,
      subject: s.subject ?? "",
      body: s.body,
    }));
    setSeqSteps(steps.length > 0 ? steps : [{ id: uid(), channel: "email", subject: "", body: "" }]);
    setActiveSeqStep(0);
    setSeqOpen(true);
  }

  const seqWriterPanel = (
    <div
      className="flex-shrink-0 flex flex-col h-full overflow-hidden transition-all duration-300"
      style={{
        width: seqOpen ? 340 : 0,
        borderLeft: seqOpen ? "1px solid #f0f0f0" : "none",
        background: "#fff",
        opacity: seqOpen ? 1 : 0,
        pointerEvents: seqOpen ? "auto" : "none",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid #f0f0f0" }}>
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4" style={{ color: "#316BFF" }} />
          <span className="text-sm font-semibold text-gray-900">Sequence Writer</span>
        </div>
        <button onClick={() => setSeqOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="flex items-center gap-1 px-3 py-2 flex-shrink-0 overflow-x-auto" style={{ borderBottom: "1px solid #f0f0f0" }}>
        {seqSteps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => setActiveSeqStep(i)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={activeSeqStep === i ? { background: "#316BFF", color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}
          >
            Step {i + 1}
          </button>
        ))}
        <button
          onClick={addSeqStep}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all"
          style={{ color: "#9ca3af" }}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {seqSteps[activeSeqStep] && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <button
              onClick={() => updateSeqStep(activeSeqStep, { channel: "email" })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all"
              style={seqSteps[activeSeqStep].channel === "email" ? { background: "#316BFF", color: "#fff" } : { color: "#6b7280" }}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
            <button
              onClick={() => updateSeqStep(activeSeqStep, { channel: "linkedin" })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all"
              style={seqSteps[activeSeqStep].channel === "linkedin" ? { background: "#0A66C2", color: "#fff" } : { color: "#6b7280" }}
            >
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </button>
          </div>
          {seqSteps[activeSeqStep].channel === "email" && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Subject</label>
              <input
                type="text"
                value={seqSteps[activeSeqStep].subject}
                onChange={(e) => updateSeqStep(activeSeqStep, { subject: e.target.value })}
                placeholder="Subject line..."
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#111" }}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</label>
            <textarea
              value={seqSteps[activeSeqStep].body}
              onChange={(e) => updateSeqStep(activeSeqStep, { body: e.target.value })}
              placeholder={seqSteps[activeSeqStep].channel === "linkedin" ? "LinkedIn message..." : "Email body..."}
              rows={12}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none leading-relaxed"
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#111" }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {seqSteps[activeSeqStep].body.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            {seqSteps.length > 1 && (
              <button
                onClick={() => removeSeqStep(activeSeqStep)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete step
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const sidebar = (
    <div
      className="w-52 flex-shrink-0 flex flex-col h-full"
      style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}
    >
      {/* Logo bar */}
      <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: "1px solid #f0f0f0" }}>
        <p className="font-bold text-sm tracking-tight text-gray-900">Copy Library</p>
        <p className="text-xs mt-0.5" style={{ color: "#A8A69F" }}>Workflows.io</p>
      </div>
      <div className="px-4 pt-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Clients</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-6 space-y-0.5">
        {loading ? (
          <div className="flex items-center gap-2 px-3 py-4 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : (
          clients.map((client) => (
            <button
              key={client.id}
              onClick={() => { setActiveClientId(client.id); setActiveCampaign(null); }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={activeClientId === client.id ? { background: "#f0f4ff", color: "#316BFF" } : { color: "#6b7280" }}
            >
              <span className="block truncate">{client.name}</span>
              <span className="block text-xs mt-0.5 truncate" style={{ color: activeClientId === client.id ? "#316BFF" : "#d1d5db" }}>
                {client.campaigns.length} campaign{client.campaigns.length !== 1 ? "s" : ""}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        {sidebar}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Loading campaigns…</p>
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

  // ── Campaign detail ───────────────────────────────────────────────────────
  if (activeCampaign) {
    const step = getActiveStep(activeCampaign);
    const isLinkedIn = activeCampaign.channel === "LinkedIn";

    return (
      <div className="flex h-screen overflow-hidden" style={{ background: "#f9fafb" }}>
        {sidebar}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setSeqOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: seqOpen ? "#316BFF" : "#f0f4ff", color: seqOpen ? "#fff" : "#316BFF" }}
              >
                <PenLine className="w-4 h-4" /> Sequence Writer
              </button>
            </div>
            <button
              onClick={() => setActiveCampaign(null)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to {activeClient?.name}
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{activeCampaign.name}</h1>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#f0f4ff", color: "#316BFF" }}>
                  {isLinkedIn ? <Linkedin className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                  {activeCampaign.channel}
                </span>
                {activeCampaign.positiveReplies > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                    {activeCampaign.positiveReplies} positive replies
                    {activeCampaign.positiveReplyRate !== null && ` · ${activeCampaign.positiveReplyRate}%`}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{activeClient?.name}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {activeCampaign.steps.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStepId((prev) => ({ ...prev, [activeCampaign.id]: s.id }))}
                  className="text-sm px-4 py-2 rounded-xl font-medium transition-all"
                  style={step.id === s.id ? { background: "#CCFF00", color: "#111" } : { background: "#fff", color: "#6b7280", border: "1px solid #e5e7eb" }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #f0f0f0", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
              {step.subject && (
                <div className="flex items-center gap-3 px-6 py-3" style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Subject</span>
                  <span className="text-sm font-medium text-gray-800">{step.subject}</span>
                </div>
              )}
              <div className="relative px-6 py-6">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed pr-20">{step.body}</pre>
                <button
                  onClick={() => copyText(step.subject ? `Subject: ${step.subject}\n\n${step.body}` : step.body, step.id)}
                  className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={copied === step.id ? { background: "#CCFF00", color: "#111" } : { background: "#f5f5f5", color: "#6b7280" }}
                >
                  {copied === step.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: "1px solid #f5f5f5" }}>
                <div className="flex items-center gap-1.5">
                  {step.channel === "linkedin" ? <Linkedin className="w-3.5 h-3.5" style={{ color: "#0A66C2" }} /> : <Mail className="w-3.5 h-3.5 text-gray-300" />}
                  <span className="text-xs text-gray-400 capitalize">{step.channel}</span>
                </div>
                <button
                  onClick={() => loadCampaignIntoWriter(activeCampaign)}
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "#316BFF" }}
                >
                  <PenLine className="w-3.5 h-3.5" /> Edit in Sequence Writer
                </button>
              </div>
            </div>
          </div>
        </div>
        {seqWriterPanel}
      </div>
    );
  }

  // ── Grid view ─────────────────────────────────────────────────────────────
  const emailCampaigns = activeClient?.campaigns.filter((c) => c.channel !== "LinkedIn") ?? [];
  const linkedinCampaigns = activeClient?.campaigns.filter((c) => c.channel === "LinkedIn") ?? [];

  function CampaignCard({ campaign }: { campaign: CopyCampaign }) {
    const isLinkedIn = campaign.channel === "LinkedIn";
    return (
      <button
        onClick={() => { setActiveCampaign(campaign); setSeqOpen(true); }}
        className="text-left transition-all hover:scale-[1.02]"
        style={{ aspectRatio: "1 / 1", background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
      >
        <div className="flex items-start justify-between">
          <ClientLogo name={campaign.client} domain={campaign.clientDomain} />
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
            style={isLinkedIn ? { background: "#e8f0fe", color: "#0A66C2" } : { background: "#f0f4ff", color: "#316BFF" }}
          >
            {isLinkedIn ? <Linkedin className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
            {campaign.channel}
          </span>
        </div>
        <div>
          <p className="font-semibold text-sm leading-snug mb-1 text-gray-900 line-clamp-2">{campaign.name}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-gray-400">{campaign.steps.length} step{campaign.steps.length !== 1 ? "s" : ""}</p>
            {campaign.positiveReplies > 0 && (
              <p className="text-xs font-medium" style={{ color: "#16a34a" }}>{campaign.positiveReplies} pos. replies</p>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f9fafb" }}>
      {sidebar}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{activeClient?.name ?? "Copy Library"}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {activeClient ? `${activeClient.campaigns.length} campaign${activeClient.campaigns.length !== 1 ? "s" : ""} · sorted by performance` : "Select a client"}
              </p>
            </div>
            <button
              onClick={() => setSeqOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
              style={{ background: seqOpen ? "#316BFF" : "#f0f4ff", color: seqOpen ? "#fff" : "#316BFF" }}
            >
              <PenLine className="w-4 h-4" /> Sequence Writer
            </button>
          </div>

          <div className="space-y-10">
            {emailCampaigns.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: "#f0f4ff", color: "#316BFF" }}>
                    <Mail className="w-3.5 h-3.5" /> Email
                  </div>
                  <span className="text-xs text-gray-400">{emailCampaigns.length} campaign{emailCampaigns.length !== 1 ? "s" : ""}</span>
                  <div className="flex-1 h-px" style={{ background: "#f0f0f0" }} />
                </div>
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                  {emailCampaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
                </div>
              </div>
            )}

            {linkedinCampaigns.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: "#e8f0fe", color: "#0A66C2" }}>
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </div>
                  <span className="text-xs text-gray-400">{linkedinCampaigns.length} campaign{linkedinCampaigns.length !== 1 ? "s" : ""}</span>
                  <div className="flex-1 h-px" style={{ background: "#f0f0f0" }} />
                </div>
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                  {linkedinCampaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {seqWriterPanel}
    </div>
  );
}
