"use client";

import { useEffect, useState } from "react";
import { getPublicBranding, localBrandAssetUrl } from "@/lib/branding";
import type { BrandingConfig } from "@/types/branding";
import { cn } from "@/lib/utils";

export function PlatformBrand({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [resolved, setResolved] = useState(false);
  useEffect(() => { void getPublicBranding().then(setBranding).catch(() => undefined).finally(() => setResolved(true)); }, []);
  const src = localBrandAssetUrl(compact ? branding?.logo.small_url : (branding?.logo.medium_url ?? branding?.logo.small_url));
  if (!resolved) return <div className={cn(compact ? "h-10 w-10" : "h-11 w-full max-w-[220px]", className)} aria-hidden="true" />;
  if (src) {
    return <img src={src} alt={branding?.app_name || "Platform"} className={cn("block max-w-full object-contain", compact ? "h-10 w-10" : "h-11 w-auto max-w-[220px]", className)} decoding="async" fetchPriority="high" />;
  }
  return <div className={cn(compact ? "h-10 w-10" : "h-11 w-full max-w-[220px]", className)} aria-hidden="true" />;
}

export function BrandingBootstrap() {
  useEffect(() => {
    void getPublicBranding().then((branding) => {
      if (branding.app_name) document.title = document.title.replace(/^LUXIA\b/i, branding.app_name);
      const href = localBrandAssetUrl(branding.favicon.url);
      if (!href) return;
      let link = document.querySelector<HTMLLinkElement>('link[data-platform-favicon="true"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        link.setAttribute("data-platform-favicon", "true");
        document.head.appendChild(link);
      }
      link.href = href;
      link.type = "image/png";
    }).catch(() => undefined);
  }, []);
  return null;
}
