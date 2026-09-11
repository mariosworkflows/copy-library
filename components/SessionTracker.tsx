"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const PAGE_NAMES: Record<string, string> = {
  "/":         "Copy Library",
  "/account":  "My Sequences",
  "/admin":    "Admin Dashboard",
  "/login":    "Login",
  "/register": "Register",
};

function getPageName(path: string) {
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  if (path.startsWith("/admin")) return "Admin Dashboard";
  return path;
}

export default function SessionTracker() {
  const pathname = usePathname();
  const recordIdRef  = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>(pathname);

  async function startPageSession(path: string) {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: crypto.randomUUID(),
          pagePath:  path,
          pageName:  getPageName(path),
        }),
      });
      const data = await res.json();
      recordIdRef.current  = data.recordId ?? null;
      startTimeRef.current = Date.now();
      currentPathRef.current = path;
    } catch {
      // silent — tracking failure must never affect the user
    }
  }

  function endPageSession() {
    const rid = recordIdRef.current;
    if (!rid) return;
    recordIdRef.current = null; // clear immediately to prevent double-end

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const payload = JSON.stringify({ recordId: rid, durationSeconds });

    // sendBeacon is fire-and-forget and survives page unload.
    // It always sends POST, so we use the dedicated /api/sessions/end endpoint.
    const sent = navigator.sendBeacon(
      "/api/sessions/end",
      new Blob([payload], { type: "application/json" })
    );

    if (!sent) {
      // Fallback for browsers where sendBeacon fails
      fetch("/api/sessions/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }

  // Start session on initial page load
  useEffect(() => {
    startPageSession(pathname);

    function onHide() {
      if (document.visibilityState === "hidden") endPageSession();
    }
    function onShow() {
      // Re-start session when the user returns to a hidden tab
      if (document.visibilityState === "visible" && !recordIdRef.current) {
        startPageSession(currentPathRef.current);
      }
    }

    document.addEventListener("visibilitychange", onHide);
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("beforeunload", endPageSession);

    return () => {
      document.removeEventListener("visibilitychange", onHide);
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("beforeunload", endPageSession);
      endPageSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // End old page session and start a new one on navigation
  useEffect(() => {
    if (pathname === currentPathRef.current) return;
    endPageSession();
    startPageSession(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
