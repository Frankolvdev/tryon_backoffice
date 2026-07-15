import { Sparkles } from "lucide-react";

import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  collapsed?: boolean;
}

export function BrandLogo({
  collapsed = false,
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        "flex min-h-20 items-center border-b border-white/6 px-5",
        collapsed
          ? "justify-center px-3"
          : "gap-3",
      )}
    >
      <div className="luxia-red-glow flex size-11 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400">
        <Sparkles size={22} />
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-[0.22em] text-white">
            {appConfig.name}
          </p>

          <p className="mt-1 truncate text-[9px] font-semibold tracking-[0.24em] text-red-500 uppercase">
            AI Fashion Studio
          </p>
        </div>
      )}
    </div>
  );
}