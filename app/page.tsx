"use client";

import { useState, useEffect } from "react";
import {
  Mail, Linkedin, Copy, Check, ArrowLeft, PenLine, Plus, Trash2, X, Loader2,
  Users, Zap, CalendarDays, DollarSign, UserPlus, Briefcase, RotateCcw,
  ThumbsUp, Eye, Globe, Video, MapPin, ChevronDown, ChevronRight,
} from "lucide-react";
import type { CopyClient, CopyCampaign, CopyStep } from "@/lib/copy-types";

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
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: "#f0f4ff", color: "#316BFF" }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: "#fff", border: "1px solid #f0f0f0" }}
    >
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={name}
        className="w-7 h-7 object-contain"
        onError={() => setFailed(true)}
      />
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

function SequenceWriterPanel({
  open, onClose, steps, setSteps, activeStep, setActiveStep,
}: {
  open: boolean;
  onClose: () => void;
  steps: SeqStep[];
  setSteps: React.Dispatch<React.SetStateAction<SeqStep[]>>;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  function addStep() {
    setSteps((prev) => [...prev, { id: uid(), channel: "email", subject: "", body: "" }]);
    setActiveStep(steps.length);
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
    setActiveStep((prev) => Math.max(0, prev - 1));
  }

  function updateStep(i: number, patch: Partial<SeqStep>) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  return (
    <div
      className="flex-shrink-0 flex flex-col h-full overflow-hidden transition-all duration-300"
      style={{
        width: open ? 340 : 0,
        borderLeft: open ? "1px solid #f0f0f0" : "none",
        background: "#fff",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid #f0f0f0" }}>
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4" style={{ color: "#316BFF" }} />
          <span className="text-sm font-semibold text-gray-900">Sequence Writer</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="flex items-center gap-1 px-3 py-2 flex-shrink-0 overflow-x-auto" style={{ borderBottom: "1px solid #f0f0f0" }}>
        {steps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(i)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={activeStep === i ? { background: "#316BFF", color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}
          >
            Step {i + 1}
          </button>
        ))}
        <button
          onClick={addStep}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all"
          style={{ color: "#9ca3af" }}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {steps[activeStep] && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <button
              onClick={() => updateStep(activeStep, { channel: "email" })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all"
              style={steps[activeStep].channel === "email" ? { background: "#316BFF", color: "#fff" } : { color: "#6b7280" }}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
            <button
              onClick={() => updateStep(activeStep, { channel: "linkedin" })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all"
              style={steps[activeStep].channel === "linkedin" ? { background: "#0A66C2", color: "#fff" } : { color: "#6b7280" }}
            >
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </button>
          </div>
          {steps[activeStep].channel === "email" && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Subject</label>
              <input
                type="text"
                value={steps[activeStep].subject}
                onChange={(e) => updateStep(activeStep, { subject: e.target.value })}
                placeholder="Subject line..."
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#111" }}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</label>
            <textarea
              value={steps[activeStep].body}
              onChange={(e) => updateStep(activeStep, { body: e.target.value })}
              placeholder={steps[activeStep].channel === "linkedin" ? "LinkedIn message..." : "Email body..."}
              rows={12}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none leading-relaxed"
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#111" }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {steps[activeStep].body.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            {steps.length > 1 && (
              <button
                onClick={() => removeStep(activeStep)}
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
}

// ── Campaign Card ────────────────────────────────────────────────────────

function CampaignCard({
  campaign,
  showClient = false,
  onClick,
}: {
  campaign: CopyCampaign;
  showClient?: boolean;
  onClick: () => void;
}) {
  const isLinkedIn = campaign.channel === "LinkedIn";
  return (
    <button
      onClick={onClick}
      className="text-left transition-all hover:scale-[1.02]"
      style={{
        aspectRatio: "1 / 1",
        background: "#fff",
        border: "1.5px solid #f0f0f0",
        borderRadius: 20,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minWidth: 0,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <ClientLogo name={campaign.client} domain={campaign.clientDomain} />
        <span
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
          style={isLinkedIn ? { background: "#e8f0fe", color: "#0A66C2" } : { background: "#f0f4ff", color: "#316BFF" }}
        >
          {isLinkedIn ? <Linkedin className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
          {campaign.channel}
        </span>
      </div>
      <div>
        {showClient && (
          <p className="text-xs text-gray-400 mb-0.5 truncate">{campaign.client}</p>
        )}
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

// ── Channel sections ─────────────────────────────────────────────────────

function ChannelGrid({
  campaigns,
  showClient,
  onSelect,
}: {
  campaigns: CopyCampaign[];
  showClient: boolean;
  onSelect: (c: CopyCampaign) => void;
}) {
  const email = campaigns.filter((c) => c.channel !== "LinkedIn");
  const linkedin = campaigns.filter((c) => c.channel === "LinkedIn");

  return (
    <div className="space-y-8">
      {email.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: "#f0f4ff", color: "#316BFF" }}>
              <Mail className="w-3.5 h-3.5" /> Email Copy
            </div>
            <span className="text-xs text-gray-400">{email.length} campaign{email.length !== 1 ? "s" : ""}</span>
            <div className="flex-1 h-px" style={{ background: "#f0f0f0" }} />
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
            {email.map((c) => (
              <CampaignCard key={c.id} campaign={c} showClient={showClient} onClick={() => onSelect(c)} />
            ))}
          </div>
        </div>
      )}
      {linkedin.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: "#e8f0fe", color: "#0A66C2" }}>
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn Copy
            </div>
            <span className="text-xs text-gray-400">{linkedin.length} campaign{linkedin.length !== 1 ? "s" : ""}</span>
            <div className="flex-1 h-px" style={{ background: "#f0f0f0" }} />
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
            {linkedin.map((c) => (
              <CampaignCard key={c.id} campaign={c} showClient={showClient} onClick={() => onSelect(c)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────

type ActiveView =
  | { type: "client"; clientId: string }
  | { type: "category"; key: string };

export default function CopyLibraryPage() {
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

  function countForKey(key: string) {
    return allCampaigns.filter((c) => categoryKeyOf(c) === key).length;
  }

  function countForGroup(groupKey: string) {
    return allCampaigns.filter((c) => c.category === groupKey).length;
  }

  function getViewCampaigns(): CopyCampaign[] {
    if (activeView.type === "client") {
      return clients.find((c) => c.id === activeView.clientId)?.campaigns ?? [];
    }
    const key = activeView.key;
    return allCampaigns.filter((c) => categoryKeyOf(c) === key);
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
      id: uid(),
      channel: s.channel,
      subject: s.subject ?? "",
      body: s.body,
    }));
    setSeqSteps(steps.length > 0 ? steps : [{ id: uid(), channel: "email", subject: "", body: "" }]);
    setActiveSeqStep(0);
    setSeqOpen(true);
  }

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────

  const sidebar = (
    <div
      className="w-56 flex-shrink-0 flex flex-col h-full overflow-y-auto"
      style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}
    >
      <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: "1px solid #f0f0f0" }}>
        <p className="font-bold text-sm tracking-tight text-gray-900">Copy Library</p>
        <p className="text-xs mt-0.5" style={{ color: "#A8A69F" }}>Workflows.io</p>
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
              <button
                key={item.key}
                onClick={() => { setActiveView({ type: "category", key: item.key }); setActiveCampaign(null); }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2"
                style={active ? { background: "#f0f4ff", color: "#316BFF" } : { color: "#6b7280" }}
              >
                <span className="flex items-center gap-2">
                  <span style={{ color: active ? "#316BFF" : "#9ca3af" }}>{item.icon}</span>
                  {item.label}
                </span>
                {count > 0 && (
                  <span className="text-xs rounded-full px-1.5 py-0.5 font-medium flex-shrink-0"
                    style={active ? { background: "#dbeafe", color: "#316BFF" } : { background: "#f3f4f6", color: "#9ca3af" }}>
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
              <button
                onClick={() => toggleGroup(group.key)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2"
                style={{ color: "#374151" }}
              >
                <span className="flex items-center gap-2">
                  <span style={{ color: "#9ca3af" }}>{group.icon}</span>
                  {group.label}
                </span>
                <span className="flex items-center gap-1.5">
                  {groupCount > 0 && (
                    <span className="text-xs rounded-full px-1.5 py-0.5 font-medium flex-shrink-0"
                      style={{ background: "#f3f4f6", color: "#9ca3af" }}>
                      {groupCount}
                    </span>
                  )}
                  {expanded
                    ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  }
                </span>
              </button>
              {expanded && (
                <div className="ml-3 space-y-0.5 mt-0.5">
                  {group.children.map((child) => {
                    const count = countForKey(child.key);
                    const active = activeView.type === "category" && activeView.key === child.key;
                    return (
                      <button
                        key={child.key}
                        onClick={() => { setActiveView({ type: "category", key: child.key }); setActiveCampaign(null); }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2"
                        style={active ? { background: "#f0f4ff", color: "#316BFF" } : { color: "#6b7280" }}
                      >
                        <span className="flex items-center gap-2">
                          <span style={{ color: active ? "#316BFF" : "#d1d5db" }}>{child.icon}</span>
                          {child.label}
                        </span>
                        {count > 0 && (
                          <span className="text-xs rounded-full px-1.5 py-0.5 font-medium flex-shrink-0"
                            style={active ? { background: "#dbeafe", color: "#316BFF" } : { background: "#f3f4f6", color: "#9ca3af" }}>
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

      {/* Divider */}
      <div className="mx-4 my-1" style={{ borderTop: "1px solid #f0f0f0" }} />

      {/* Clients — collapsible dropdown */}
      <div className="px-2 pb-6">
        <button
          onClick={() => toggleGroup("clients")}
          className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2"
          style={{ color: "#374151" }}
        >
          <span className="flex items-center gap-2">
            <span style={{ color: "#9ca3af" }}><Users className="w-3.5 h-3.5" /></span>
            Clients
          </span>
          <span className="flex items-center gap-1.5">
            {clients.length > 0 && (
              <span className="text-xs rounded-full px-1.5 py-0.5 font-medium" style={{ background: "#f3f4f6", color: "#9ca3af" }}>
                {clients.length}
              </span>
            )}
            {expandedGroups.has("clients")
              ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            }
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
                  <button
                    key={client.id}
                    onClick={() => { setActiveView({ type: "client", clientId: client.id }); setActiveCampaign(null); }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2"
                    style={active ? { background: "#f0f4ff", color: "#316BFF" } : { color: "#6b7280" }}
                  >
                    <span className="truncate">{client.name}</span>
                    <span className="text-xs rounded-full px-1.5 py-0.5 font-medium flex-shrink-0"
                      style={active ? { background: "#dbeafe", color: "#316BFF" } : { background: "#f3f4f6", color: "#9ca3af" }}>
                      {client.campaigns.length}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── Campaign detail ───────────────────────────────────────────────────────

  if (activeCampaign) {
    const step = getActiveStep(activeCampaign);
    const isLinkedIn = activeCampaign.channel === "LinkedIn";
    const backLabel = activeView.type === "client"
      ? clients.find((c) => c.id === activeView.clientId)?.name ?? "Back"
      : labelForKey(activeView.key);

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
              <ArrowLeft className="w-4 h-4" /> Back to {backLabel}
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{activeCampaign.name}</h1>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "#f0f4ff", color: "#316BFF" }}>
                  {isLinkedIn ? <Linkedin className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                  {activeCampaign.channel}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "#f3f4f6", color: "#6b7280" }}>
                  {labelForKey(categoryKeyOf(activeCampaign))}
                </span>
                {activeCampaign.positiveReplies > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "#f0fdf4", color: "#16a34a" }}>
                    {activeCampaign.positiveReplies} positive replies
                    {activeCampaign.positiveReplyRate !== null && ` · ${activeCampaign.positiveReplyRate}%`}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{activeCampaign.client}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {activeCampaign.steps.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStepId((prev) => ({ ...prev, [activeCampaign.id]: s.id }))}
                  className="text-sm px-4 py-2 rounded-xl font-medium transition-all"
                  style={step.id === s.id
                    ? { background: "#CCFF00", color: "#111" }
                    : { background: "#fff", color: "#6b7280", border: "1px solid #e5e7eb" }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#fff", border: "1.5px solid #f0f0f0", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
              {step.subject && (
                <div className="flex items-center gap-3 px-6 py-3"
                  style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
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
                    : { background: "#f5f5f5", color: "#6b7280" }}
                >
                  {copied === step.id
                    ? <><Check className="w-3.5 h-3.5" /> Copied</>
                    : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: "1px solid #f5f5f5" }}>
                <div className="flex items-center gap-1.5">
                  {step.channel === "linkedin"
                    ? <Linkedin className="w-3.5 h-3.5" style={{ color: "#0A66C2" }} />
                    : <Mail className="w-3.5 h-3.5 text-gray-300" />}
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
        <SequenceWriterPanel
          open={seqOpen}
          onClose={() => setSeqOpen(false)}
          steps={seqSteps}
          setSteps={setSeqSteps}
          activeStep={activeSeqStep}
          setActiveStep={setActiveSeqStep}
        />
      </div>
    );
  }

  // ── Grid view ─────────────────────────────────────────────────────────────

  const viewCampaigns = getViewCampaigns();
  const viewTitle = activeView.type === "client"
    ? clients.find((c) => c.id === activeView.clientId)?.name ?? "Client"
    : labelForKey(activeView.key);
  const showClientOnCard = activeView.type === "category";

  function onSelectCampaign(c: CopyCampaign) {
    setActiveCampaign(c);
    setSeqOpen(true);
  }

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
    <div className="flex h-screen overflow-hidden" style={{ background: "#f9fafb" }}>
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
            <button
              onClick={() => setSeqOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
              style={{ background: seqOpen ? "#316BFF" : "#f0f4ff", color: seqOpen ? "#fff" : "#316BFF" }}
            >
              <PenLine className="w-4 h-4" /> Sequence Writer
            </button>
          </div>

          {viewCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <p className="text-sm">No campaigns in this category yet.</p>
            </div>
          ) : (
            <ChannelGrid
              campaigns={viewCampaigns}
              showClient={showClientOnCard}
              onSelect={onSelectCampaign}
            />
          )}
        </div>
      </div>
      <SequenceWriterPanel
        open={seqOpen}
        onClose={() => setSeqOpen(false)}
        steps={seqSteps}
        setSteps={setSeqSteps}
        activeStep={activeSeqStep}
        setActiveStep={setActiveSeqStep}
      />
    </div>
  );
}
