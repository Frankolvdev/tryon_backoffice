import { PlatformBrand } from "@/components/backoffice/platform-brand";
import { cn } from "@/lib/utils";

interface BrandLogoProps { collapsed?: boolean; }

export function BrandLogo({ collapsed = false }: BrandLogoProps) {
  return (
    <div className={cn("flex min-h-20 items-center border-b border-white/6 px-5", collapsed ? "justify-center px-3" : "gap-3")}>
      <PlatformBrand compact={collapsed} />
    </div>
  );
}
