"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Registration failed. Please try again.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9fafb" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: "#316BFF" }}>
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Copy Library</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Workflows.io</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "#fff", border: "1.5px solid #f0f0f0", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Create account</h2>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: "#fef2f2", color: "#dc2626" }}>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              Account created! Redirecting to sign in…
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                  style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
                  onFocus={(e) => (e.target.style.borderColor = "#316BFF")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@workflows.io"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                  style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
                  onFocus={(e) => (e.target.style.borderColor = "#316BFF")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <p className="mt-1.5 text-xs" style={{ color: "#94a3b8" }}>
                Must be a @workflows.io address
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl outline-none transition-all"
                  style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
                  onFocus={(e) => (e.target.style.borderColor = "#316BFF")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs" style={{ color: "#94a3b8" }}>Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
              style={{ background: "#316BFF", color: "#fff" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "#316BFF" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
