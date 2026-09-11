"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Key, Copy, RefreshCw, Trash, CheckCircle2,
  Loader2, User, Mail, Lock, Eye, EyeOff, Plug, Save,
  ShieldCheck,
} from "lucide-react";

type Tab = "integrations" | "profile";

// ── API Key Section ───────────────────────────────────────────────────────────

function IntegrationsTab() {
  const { data: session } = useSession();
  const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null);
  const [apiKeyHasKey, setApiKeyHasKey] = useState(false);
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  useEffect(() => {
    fetch("/api/account/api-key")
      .then((r) => r.json())
      .then((d) => { setApiKeyHasKey(d.hasKey); setApiKeyPreview(d.preview ?? null); })
      .finally(() => setApiKeyLoading(false));
  }, []);

  async function generateKey() {
    setApiKeyLoading(true);
    setNewlyGeneratedKey(null);
    try {
      const res = await fetch("/api/account/api-key", { method: "POST" });
      const d = await res.json();
      if (d.key) { setNewlyGeneratedKey(d.key); setApiKeyPreview(d.preview); setApiKeyHasKey(true); }
    } finally { setApiKeyLoading(false); }
  }

  async function revokeKey() {
    if (!confirm("Revoke your API key? Any scripts using it will stop working immediately.")) return;
    setApiKeyLoading(true);
    try {
      await fetch("/api/account/api-key", { method: "DELETE" });
      setApiKeyHasKey(false); setApiKeyPreview(null); setNewlyGeneratedKey(null);
    } finally { setApiKeyLoading(false); }
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* API Key card */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #e5e7eb" }}>
        <div className="flex items-center gap-3 px-6 py-4" style={{ background: "#f9fafb", borderBottom: "1.5px solid #f0f0f0" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
            <Key className="w-4 h-4" style={{ color: "#316BFF" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Copy Library API Key</p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              Use your API key to pull sequences into Claude Code or any script
            </p>
          </div>
        </div>

        <div className="px-6 py-5 bg-white">
          {apiKeyLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : newlyGeneratedKey ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "#16a34a" }}>
                <CheckCircle2 className="w-4 h-4" />
                Key generated — copy it now. You won&apos;t see the full key again.
              </div>
              <div className="flex items-center gap-2 rounded-xl px-4 py-3"
                style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                <code className="flex-1 text-xs font-mono text-gray-800 break-all">{newlyGeneratedKey}</code>
                <button onClick={() => copyKey(newlyGeneratedKey)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: keyCopied ? "#16a34a" : "#316BFF", color: "#fff" }}>
                  {keyCopied ? <><CheckCircle2 className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "#f8fafc", border: "1.5px solid #e5e7eb" }}>
                <p className="font-semibold text-gray-700 mb-1.5">How to use</p>
                <code className="block text-gray-600 font-mono whitespace-pre-wrap leading-relaxed">{`curl https://copy-library-eosin.vercel.app/api/v1/sequences \\
  -H "Authorization: Bearer ${newlyGeneratedKey.slice(0, 10)}…"`}</code>
              </div>
            </div>
          ) : apiKeyHasKey ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#16a34a" }} />
                <div>
                  <p className="text-sm font-medium text-gray-800">Active key</p>
                  <p className="text-xs font-mono" style={{ color: "#94a3b8" }}>{apiKeyPreview}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={generateKey} disabled={apiKeyLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                  style={{ background: "#f0f4ff", color: "#316BFF", border: "1.5px solid #dbeafe" }}>
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
                <button onClick={revokeKey} disabled={apiKeyLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                  style={{ background: "#fff5f5", color: "#dc2626", border: "1.5px solid #fecaca" }}>
                  <Trash className="w-3 h-3" /> Revoke
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">No API key yet. Generate one to access your sequences programmatically.</p>
              <button onClick={generateKey} disabled={apiKeyLoading}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: "#316BFF", color: "#fff", boxShadow: "0 2px 8px rgba(49,107,255,0.3)" }}>
                {apiKeyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Generate API Key
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Coming soon placeholder */}
      <div className="rounded-2xl px-6 py-5 flex items-center gap-4"
        style={{ background: "#f9fafb", border: "1.5px dashed #e5e7eb" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#f3f4f6" }}>
          <Plug className="w-4 h-4" style={{ color: "#9ca3af" }} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">More integrations coming soon</p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>CRM sync, Zapier, and more</p>
        </div>
      </div>
    </div>
  );
}

// ── Profile Section ───────────────────────────────────────────────────────────

function ProfileTab() {
  const { data: session } = useSession();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  // Sync name from session once loaded
  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function saveName() {
    if (!name.trim()) { setNameError("Name cannot be empty"); return; }
    setNameError(""); setNameSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const d = await res.json();
      if (!res.ok) { setNameError(d.error ?? "Failed to update name"); return; }
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } finally { setNameSaving(false); }
  }

  async function changePassword() {
    setPwError("");
    if (!currentPw || !newPw || !confirmPw) { setPwError("All fields are required"); return; }
    if (newPw !== confirmPw) { setPwError("New passwords don't match"); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters"); return; }
    setPwSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const d = await res.json();
      if (!res.ok) { setPwError(d.error ?? "Failed to change password"); return; }
      setPwSaved(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSaved(false), 3000);
    } finally { setPwSaving(false); }
  }

  const inputStyle = {
    background: "#f9fafb", border: "1.5px solid #e5e7eb",
    color: "#111", transition: "border-color 0.15s",
  };

  return (
    <div className="space-y-6">
      {/* Account info card */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #e5e7eb" }}>
        <div className="flex items-center gap-3 px-6 py-4" style={{ background: "#f9fafb", borderBottom: "1.5px solid #f0f0f0" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
            <User className="w-4 h-4" style={{ color: "#316BFF" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Account Info</p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>Update your display name</p>
          </div>
        </div>
        <div className="px-6 py-5 bg-white space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#316BFF,#60a5fa)" }}>
              {(name || session?.user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{session?.user?.name}</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>{session?.user?.email}</p>
            </div>
          </div>

          {/* Name field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#94a3b8" }}>
              Display Name
            </label>
            <div className="flex gap-2">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#316BFF")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button onClick={saveName} disabled={nameSaving}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex-shrink-0"
                style={{ background: nameSaved ? "#16a34a" : "#316BFF", color: "#fff", transition: "background 0.3s" }}>
                {nameSaving ? <Loader2 className="w-4 h-4 animate-spin" />
                  : nameSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                  : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
            {nameError && <p className="text-xs mt-1.5" style={{ color: "#dc2626" }}>{nameError}</p>}
            {nameSaved && <p className="text-xs mt-1.5" style={{ color: "#16a34a" }}>Name updated. Takes effect on next login.</p>}
          </div>

          {/* Email — read only */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#94a3b8" }}>
              Email Address
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{ background: "#f3f4f6", border: "1.5px solid #e5e7eb", color: "#6b7280" }}>
              <Mail className="w-4 h-4 flex-shrink-0" style={{ color: "#9ca3af" }} />
              {session?.user?.email}
            </div>
            <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Password card */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #e5e7eb" }}>
        <div className="flex items-center gap-3 px-6 py-4" style={{ background: "#f9fafb", borderBottom: "1.5px solid #f0f0f0" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
            <ShieldCheck className="w-4 h-4" style={{ color: "#316BFF" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Change Password</p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>Choose a strong password with at least 8 characters</p>
          </div>
        </div>
        <div className="px-6 py-5 bg-white space-y-4">
          {[
            { label: "Current Password", value: currentPw, set: setCurrentPw, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
            { label: "New Password", value: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(p => !p) },
            { label: "Confirm New Password", value: confirmPw, set: setConfirmPw, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
          ].map(({ label, value, set, show, toggle }) => (
            <div key={label}>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#94a3b8" }}>
                {label}
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#316BFF")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button type="button" onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {pwError && (
            <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2.5"
              style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626" }}>
              <Lock className="w-3.5 h-3.5 flex-shrink-0" /> {pwError}
            </div>
          )}
          {pwSaved && (
            <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2.5"
              style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", color: "#16a34a" }}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Password changed successfully!
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={changePassword} disabled={pwSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: "#316BFF", color: "#fff", boxShadow: "0 2px 8px rgba(49,107,255,0.3)" }}>
              {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {pwSaving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("integrations");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9fafb" }}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "integrations", label: "Integrations", icon: <Plug className="w-4 h-4" /> },
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen" style={{ background: "#f9fafb" }}>
        {/* Header */}
        <div className="px-8 py-4 flex items-center justify-between sticky top-0 z-10"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1.5px solid #f0f0f0" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Library
            </button>
            <div className="w-px h-4" style={{ background: "#e5e7eb" }} />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "#316BFF" }}>
                {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <span className="text-sm font-semibold text-gray-900">{session?.user?.name}</span>
              <span className="text-xs text-gray-400 hidden sm:block">{session?.user?.email}</span>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Sign out
          </button>
        </div>

        {/* Page body */}
        <div className="max-w-2xl mx-auto px-8 py-10" style={{ animation: "fadeSlideUp 0.3s cubic-bezier(0.4,0,0.2,1) both" }}>
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your account and integrations</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "#f3f4f6", width: "fit-content" }}>
            {tabs.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm font-semibold transition-all"
                style={{
                  background: tab === id ? "#fff" : "transparent",
                  color: tab === id ? "#316BFF" : "#6b7280",
                  boxShadow: tab === id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                }}>
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div key={tab} style={{ animation: "fadeSlideUp 0.25s cubic-bezier(0.4,0,0.2,1) both" }}>
            {tab === "integrations" ? <IntegrationsTab /> : <ProfileTab />}
          </div>
        </div>
      </div>
    </>
  );
}
