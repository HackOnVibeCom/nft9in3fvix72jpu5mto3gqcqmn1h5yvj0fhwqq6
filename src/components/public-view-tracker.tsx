"use client";
import { useEffect } from "react";
export function PublicViewTracker() {
  useEffect(() => {
    const slug = window.location.pathname.split("/").filter(Boolean).at(-1);
    if (slug) void fetch("/api/analytics/event", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug }), keepalive: true }).catch(() => {});
  }, []);
  return null;
}
