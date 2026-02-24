"use client";

import { useEffect } from "react";

const ROLE_CONFIG: Record<string, { letter: string; bg: string; fg: string }> =
  {
    ADMIN: { letter: "A", bg: "#dc2626", fg: "#ffffff" }, // red
    MANAGER: { letter: "M", bg: "#4f46e5", fg: "#ffffff" }, // indigo
    MEMBER: { letter: "M", bg: "#2563eb", fg: "#ffffff" }, // blue (MANAGER=indigo で色で区別)
    CUSTOMER: { letter: "C", bg: "#0d9488", fg: "#ffffff" }, // teal
  };

const DEFAULT = { letter: "R", bg: "#6b7280", fg: "#ffffff" };

function buildSvgDataUrl(letter: string, bg: string, fg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="${bg}"/>
  <text x="16" y="22" text-anchor="middle" font-family="Arial,sans-serif"
    font-size="18" font-weight="bold" fill="${fg}">${letter}</text>
</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function setFavicon(href: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function DynamicFavicon() {
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const role: string = userStr ? (JSON.parse(userStr).role ?? "") : "";
      const cfg = ROLE_CONFIG[role] ?? DEFAULT;
      setFavicon(buildSvgDataUrl(cfg.letter, cfg.bg, cfg.fg));
    } catch {
      const cfg = DEFAULT;
      setFavicon(buildSvgDataUrl(cfg.letter, cfg.bg, cfg.fg));
    }

    // ログイン/ログアウト時にも更新
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "user") return;
      try {
        const role: string = e.newValue
          ? (JSON.parse(e.newValue).role ?? "")
          : "";
        const cfg = ROLE_CONFIG[role] ?? DEFAULT;
        setFavicon(buildSvgDataUrl(cfg.letter, cfg.bg, cfg.fg));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
