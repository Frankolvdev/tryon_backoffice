"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { appConfig } from "@/config/app";
import { getPublicBranding, localBrandAssetUrl } from "@/lib/branding";
import type { BrandingConfig } from "@/types/branding";
import { cn } from "@/lib/utils";

export function PlatformBrand({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  useEffect(() => { void getPublicBranding().then(setBranding).catch(() => undefined); }, []);
  const src = localBrandAssetUrl(compact ? branding?.logo.small_url : (branding?.logo.medium_url ?? branding?.logo.small_url));
  if (src) {
    return <img src={src} alt={appConfig.name} className={cn("block max-w-full object-contain", compact ? "h-10 w-10" : "h-11 w-auto max-w-[220px]", className)} decoding="async" fetchPriority="high" />;
  }
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="luxia-red-glow flex size-11 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400"><Sparkles size={22}/></div>
      {!compact && <div><p className="truncate text-base font-semibold tracking-[0.22em] text-white">{appConfig.name}</p><p className="mt-1 truncate text-[9px] font-semibold tracking-[0.24em] text-red-500 uppercase">AI Fashion Studio</p></div>}
    </div>
  );
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
