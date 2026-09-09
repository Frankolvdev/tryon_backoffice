import type { BrandingConfig } from "@/types/branding";

let cached: BrandingConfig | null = null;
let inflight: Promise<BrandingConfig> | null = null;

export function localBrandAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/branding\/assets\/([^?]+)(\?.*)?$/);
  return match ? `/api/branding/assets/${match[1]}${match[2] ?? ""}` : url;
}

export async function getPublicBranding(force = false): Promise<BrandingConfig> {
  if (!force && cached) return cached;
  if (!force && inflight) return inflight;
  inflight = fetch("/api/branding", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("branding unavailable");
      const value = await response.json() as BrandingConfig;
      cached = value;
      return value;
    })
    .finally(() => { inflight = null; });
  return inflight;
}

export function invalidateBrandingCache() {
  cached = null;
}
