"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Sparkles } from "lucide-react";

import { tryOnSections } from "@/config/tryon-navigation";
import { cn } from "@/lib/utils";

interface TryOnModuleHeaderProps {
  title: string;
  description: string;
}

export function TryOnModuleHeader({
  title,
  description,
}: TryOnModuleHeaderProps) {
  const pathname = usePathname();

  return (
    <header>
      <div className="flex items-start gap-4">
        <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
          <Sparkles size={25} />
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-[0.26em] text-red-500 uppercase">
            Motor de inteligencia artificial
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
      </div>

      <nav className="mt-7 overflow-x-auto border-b border-white/6">
        <div className="flex min-w-max gap-1 pb-2">
          {tryOnSections.map((section) => {
            const Icon = section.icon;

            const active =
              pathname === section.href ||
              (
                section.href !== "/dashboard/tryon" &&
                pathname.startsWith(`${section.href}/`)
              );

            return (
              <Link
                key={section.key}
                href={section.href}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-xl border px-4 text-sm transition",
                  active
                    ? "border-red-500/15 bg-red-950/30 text-red-300"
                    : "border-transparent text-zinc-600 hover:border-white/6 hover:bg-white/[0.025] hover:text-zinc-300",
                )}
              >
                <Icon size={16} />
                {section.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
