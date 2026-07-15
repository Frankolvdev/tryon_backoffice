"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Globe2,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Configuración general",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Configuración pública",
    href: "/dashboard/settings/public",
    icon: Globe2,
  },
  {
    label: "Configuración avanzada",
    href: "/dashboard/settings/advanced",
    icon: ShieldCheck,
  },
];

export function SystemSettingsTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-5 flex flex-wrap gap-2">
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
                ? "border-red-500/20 bg-red-950/20 text-red-300"
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
