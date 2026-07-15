"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FileClock,
  Files,
  RotateCcw,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Registros",
    href: "/dashboard/audit",
    icon: FileClock,
  },
  {
    label: "Entradas avanzadas",
    href: "/dashboard/audit/entries",
    icon: Files,
  },
  {
    label: "Operaciones",
    href: "/dashboard/audit/operations",
    icon: Wrench,
  },
  {
    label: "Restaurar y exportar",
    href: "/dashboard/audit/restore-export",
    icon: RotateCcw,
  },
];

export function AuditTabs() {
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
