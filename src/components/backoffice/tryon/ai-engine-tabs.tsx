"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Cpu,
  Database,
  Gauge,
  Network,
  FlaskConical,
  Server,
} from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Proveedores",
    href: "/dashboard/tryon/integrations/providers",
    icon: Network,
  },
  {
    label: "Simulado",
    href: "/dashboard/tryon/integrations/simulated",
    icon: FlaskConical,
  },
  {
    label: "ComfyUI",
    href: "/dashboard/tryon/integrations",
    icon: Cpu,
  },
  {
    label: "RunPod",
    href: "/dashboard/tryon/integrations/runpod",
    icon: Server,
  },
  {
    label: "Storage",
    href: "/dashboard/tryon/integrations/storage",
    icon: Database,
  },
  {
    label: "Monitoreo",
    href: "/dashboard/tryon/integrations/monitoring",
    icon: Gauge,
  },
];

export function AiEngineTabs() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active =
          pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm transition",
              active
                ? "border-red-500/15 bg-red-950/25 text-red-300"
                : "border-white/7 bg-white/[0.025] text-zinc-500 hover:text-white",
            )}
          >
            <Icon size={15} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
