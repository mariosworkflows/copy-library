"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Invalid email or password." : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F7F7" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
            style={{ background: "#0C0D0E" }}>
            <span className="text-white font-bold text-base">W</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#0C0D0E", fontWeight: 270 }}>Copy Library</h1>
          <p className="text-sm mt-1" style={{ color: "#6B787A" }}>Workflows.io</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 wf-card">
          <h2 className="text-lg mb-6" style={{ color: "#0C0D0E", fontWeight: 550 }}>Sign in</h2>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: "#fef2f2", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "#6B787A", fontWeight: 550, letterSpacing: "0.04em" }}>Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#A3B0B6" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@workflows.io"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                  style={{ border: "1.5px solid #E7E9E9", background: "#F7F7F7", color: "#0C0D0E" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0C0D0E")}
                  onBlur={(e) => (e.target.style.borderColor = "#E7E9E9")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide mb-1.5" style={{ color: "#6B787A", fontWeight: 550, letterSpacing: "0.04em" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#A3B0B6" }} />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl outline-none transition-all"
                  style={{ border: "1.5px solid #E7E9E9", background: "#F7F7F7", color: "#0C0D0E" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0C0D0E")}
                  onBlur={(e) => (e.target.style.borderColor = "#E7E9E9")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#A3B0B6" }}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
              style={{ background: "#0C0D0E", color: "#FFFFFF", fontWeight: 550 }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "#6B787A" }}>
          No account?{" "}
          <Link href="/register" className="font-semibold" style={{ color: "#0C0D0E" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
