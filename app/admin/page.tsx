"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Clock, Activity, ChevronDown, ChevronRight, LogOut, LayoutGrid } from "lucide-react";
import { signOut } from "next-auth/react";

type PageStat = { pagePath: string; pageName: string; totalSeconds: number; visits: number };

type PageSession = {
  startTime: string;
  endTime: string | null;
  durationSeconds: number;
  status: string;
  pagePath: string;
  pageName: string;
};

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  sessions: PageSession[];
  pageStats: PageStat[];
  totalSessions: number;
  totalTimeSeconds: number;
  lastSeen: string | null;
};

function formatDuration(seconds: number) {
  if (!seconds || seconds < 1) return "0s";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const PAGE_COLORS: Record<string, { bg: string; color: string }> = {
  "/":        { bg: "#eff6ff", color: "#316BFF" },
  "/account": { bg: "#f0fdf4", color: "#16a34a" },
  "/admin":   { bg: "#fdf4ff", color: "#9333ea" },
};
function pageColor(path: string) {
  return PAGE_COLORS[path] ?? { bg: "#f9fafb", color: "#6b7280" };
}

function TimeBar({ seconds, max }: { seconds: number; max: number }) {
  const pct = max > 0 ? Math.round((seconds / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f0f0f0" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "#316BFF", opacity: 0.7 }} />
      </div>
      <span className="text-xs font-semibold w-12 text-right" style={{ color: "#374151" }}>
        {formatDuration(seconds)}
      </span>
    </div>
  );
}

function UserRow({ user }: { user: UserRecord }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"pages" | "sessions">("pages");
  const maxPageSeconds = Math.max(...(user.pageStats.map((p) => p.totalSeconds)), 1);

  return (
    <>
      <tr className="border-b cursor-pointer transition-colors"
        style={{ borderColor: "#f0f0f0" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        onClick={() => setOpen((v) => !v)}>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "#316BFF" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>{user.email}</p>
            </div>
          </div>
        </td>
        <td className="px-5 py-4">
          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
            style={user.role === "admin"
              ? { background: "#eff6ff", color: "#316BFF" }
              : { background: "#f0fdf4", color: "#16a34a" }}>
            {user.role === "admin" ? "Admin" : "Member"}
          </span>
        </td>
        <td className="px-5 py-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
        <td className="px-5 py-4 text-sm text-gray-600">{formatDateTime(user.lastSeen)}</td>
        <td className="px-5 py-4 text-sm text-gray-600">{user.totalSessions}</td>
        <td className="px-5 py-4">
          <span className="text-sm font-semibold" style={{ color: "#316BFF" }}>
            {formatDuration(user.totalTimeSeconds)}
          </span>
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center justify-center text-gray-400">
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </td>
      </tr>

      {open && (
        <tr style={{ borderBottom: "1.5px solid #f0f0f0" }}>
          <td colSpan={7} className="px-5 pb-5 pt-0">
            <div className="pl-10 pt-4">
              {/* Tab toggle */}
              <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: "#f3f4f6" }}>
                {([["pages", "Pages & Time", LayoutGrid], ["sessions", "Session Log", Activity]] as const).map(([key, label, Icon]) => (
                  <button key={key} onClick={(e) => { e.stopPropagation(); setTab(key); }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: tab === key ? "#fff" : "transparent",
                      color: tab === key ? "#316BFF" : "#6b7280",
                      boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    }}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>

              {tab === "pages" && (
                <div>
                  {user.pageStats.length === 0 ? (
                    <p className="text-sm text-gray-400">No page data recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {user.pageStats.map((p) => {
                        const { bg, color } = pageColor(p.pagePath);
                        return (
                          <div key={p.pagePath} className="flex items-center gap-4 py-2.5 px-4 rounded-xl"
                            style={{ background: "#f9fafb", border: "1.5px solid #f0f0f0" }}>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
                              style={{ background: bg, color }}>
                              {p.pageName}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0 w-20">
                              {p.visits} visit{p.visits !== 1 ? "s" : ""}
                            </span>
                            <TimeBar seconds={p.totalSeconds} max={maxPageSeconds} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab === "sessions" && (
                <div>
                  {user.sessions.length === 0 ? (
                    <p className="text-sm text-gray-400">No sessions recorded yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                          <th className="pb-2 text-left font-semibold">Page</th>
                          <th className="pb-2 text-left font-semibold">Start</th>
                          <th className="pb-2 text-left font-semibold">End</th>
                          <th className="pb-2 text-left font-semibold">Duration</th>
                          <th className="pb-2 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.sessions.slice(0, 30).map((s, i) => {
                          const { bg, color } = pageColor(s.pagePath);
                          return (
                            <tr key={i} className="border-t" style={{ borderColor: "#f5f5f5" }}>
                              <td className="py-2 pr-4">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                                  style={{ background: bg, color }}>{s.pageName}</span>
                              </td>
                              <td className="py-2 pr-4 text-gray-600 text-xs">{formatDateTime(s.startTime)}</td>
                              <td className="py-2 pr-4 text-gray-600 text-xs">{formatDateTime(s.endTime)}</td>
                              <td className="py-2 pr-4 text-xs font-semibold" style={{ color: "#316BFF" }}>
                                {formatDuration(s.durationSeconds)}
                              </td>
                              <td className="py-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                  style={s.status === "active"
                                    ? { background: "#f0fdf4", color: "#16a34a" }
                                    : { background: "#f9fafb", color: "#6b7280" }}>
                                  {s.status === "active" ? "Active" : "Ended"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = (session?.user as { role?: string })?.role;

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && role !== "admin") { router.push("/"); return; }
    if (status === "authenticated" && role === "admin") {
      fetch("/api/admin/users")
        .then((r) => r.json())
        .then((d) => { if (d.error) throw new Error(d.error); setUsers(d.users); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [status, role, router]);

  const totalTime = users.reduce((a, u) => a + u.totalTimeSeconds, 0);
  const totalSessions = users.reduce((a, u) => a + u.totalSessions, 0);

  // Top page across all users
  const allPageStats: Record<string, number> = {};
  for (const u of users) {
    for (const p of u.pageStats) {
      allPageStats[p.pageName] = (allPageStats[p.pageName] ?? 0) + p.totalSeconds;
    }
  }
  const topPage = Object.entries(allPageStats).sort((a, b) => b[1] - a[1])[0];

  if (status === "loading" || (loading && role === "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9fafb" }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "#316BFF", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9fafb" }}>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>
      {/* Header */}
      <div className="px-8 py-5 flex items-center justify-between sticky top-0 z-10"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1.5px solid #f0f0f0" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#316BFF" }}>
            <span className="text-white font-bold text-base">W</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Copy Library</p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-sm font-semibold transition-colors"
            style={{ color: "#316BFF" }}>
            Back to Library
          </button>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { icon: Users,      iconBg: "#eff6ff",  iconColor: "#316BFF", label: "Total Users",    value: users.length.toString() },
            { icon: Activity,   iconBg: "#f0fdf4",  iconColor: "#16a34a", label: "Total Sessions", value: totalSessions.toString() },
            { icon: Clock,      iconBg: "#fef9c3",  iconColor: "#ca8a04", label: "Total Time",     value: formatDuration(totalTime) },
            { icon: LayoutGrid, iconBg: "#fdf4ff",  iconColor: "#9333ea", label: "Top Page",       value: topPage ? topPage[0] : "—" },
          ].map(({ icon: Icon, iconBg, iconColor, label, value }) => (
            <div key={label} className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #f0f0f0" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
                  <Icon className="w-4 h-4" style={{ color: iconColor }} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>{label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #f0f0f0" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "#f0f0f0" }}>
            <h2 className="text-sm font-bold text-gray-900">Users & Activity</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              Click any row to see time spent per page and full session log
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wide"
                  style={{ borderColor: "#f0f0f0", color: "#94a3b8" }}>
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Joined</th>
                  <th className="px-5 py-3 text-left">Last Seen</th>
                  <th className="px-5 py-3 text-left">Sessions</th>
                  <th className="px-5 py-3 text-left">Total Time</th>
                  <th className="px-5 py-3 text-left w-8"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => <UserRow key={u.id} user={u} />)}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
