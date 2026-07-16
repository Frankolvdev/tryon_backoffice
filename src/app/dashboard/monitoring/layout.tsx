"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  Gauge,
} from "lucide-react";

interface Props {
  children: ReactNode;
}

const tabs = [
  {
    label: "Estado del sistema",
    href: "/dashboard/monitoring",
    icon: Gauge,
  },
  {
    label: "Eventos operativos",
    href: "/dashboard/monitoring/events",
    icon: Activity,
  },
];

export default function MonitoringLayout({
  children,
}: Props) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="luxia-panel mb-5 flex gap-2 overflow-x-auto rounded-3xl p-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            pathname === tab.href ||
            pathname.startsWith(
              `${tab.href}/`,
            );

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={
                active
                  ? "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/25 px-4 text-sm font-semibold text-red-300"
                  : "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-transparent px-4 text-sm text-zinc-600 hover:border-white/7 hover:bg-white/[0.025] hover:text-zinc-300"
              }
            >
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
