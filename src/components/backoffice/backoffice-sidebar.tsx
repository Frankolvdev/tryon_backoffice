"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { BrandLogo } from "@/components/backoffice/brand-logo";
import { useSidebar } from "@/components/backoffice/sidebar-provider";
import { backofficeNavigation } from "@/config/backoffice-navigation";
import { cn } from "@/lib/utils";

function getActiveNavigationHref(
  pathname: string,
): string | undefined {
  return backofficeNavigation
    .flatMap((group) => group.items)
    .filter(
      (item) =>
        item.href !== undefined &&
        !item.disabled &&
        (pathname === item.href ||
          pathname.startsWith(`${item.href}/`)),
    )
    .sort(
      (first, second) =>
        (second.href?.length ?? 0) -
        (first.href?.length ?? 0),
    )[0]?.href;
}

function SidebarContent() {
  const pathname = usePathname();
  const activeHref =
    getActiveNavigationHref(pathname);

  const {
    isCollapsed,
    closeMobile,
    toggleCollapsed,
  } = useSidebar();

  return (
    <div className="flex h-full flex-col">
      <BrandLogo collapsed={isCollapsed} />

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {backofficeNavigation.map((group) => (
            <section key={group.label}>
              {!isCollapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.22em] text-zinc-700 uppercase">
                  {group.label}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href !== undefined &&
                    item.href === activeHref;

                  if (
                    item.disabled ||
                    !item.href
                  ) {
                    return (
                      <div
                        key={item.label}
                        title={
                          isCollapsed
                            ? item.label
                            : undefined
                        }
                        className={cn(
                          "flex h-10 cursor-not-allowed items-center rounded-xl text-zinc-700",
                          isCollapsed
                            ? "justify-center px-2"
                            : "gap-3 px-3",
                        )}
                      >
                        <Icon
                          size={17}
                          strokeWidth={1.7}
                        />

                        {!isCollapsed && (
                          <span className="truncate text-sm">
                            {item.label}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      title={
                        isCollapsed
                          ? item.label
                          : undefined
                      }
                      onClick={closeMobile}
                      className={cn(
                        "group flex h-10 items-center rounded-xl border text-sm transition",
                        isCollapsed
                          ? "justify-center px-2"
                          : "gap-3 px-3",
                        isActive
                          ? "border-red-500/15 bg-gradient-to-r from-red-950/45 to-red-950/10 text-white shadow-[0_0_28px_rgba(150,10,30,0.12)]"
                          : "border-transparent text-zinc-500 hover:border-white/5 hover:bg-white/[0.025] hover:text-zinc-200",
                      )}
                    >
                      <Icon
                        size={17}
                        strokeWidth={1.8}
                        className={cn(
                          "shrink-0 transition",
                          isActive
                            ? "text-red-400"
                            : "text-zinc-600 group-hover:text-zinc-300",
                        )}
                      />

                      {!isCollapsed && (
                        <span className="truncate">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <div className="hidden border-t border-white/6 p-3 lg:block">
        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            "flex h-10 w-full items-center rounded-xl border border-white/6 bg-white/[0.02] text-zinc-500 transition hover:bg-white/[0.05] hover:text-white",
            isCollapsed
              ? "justify-center"
              : "justify-between px-3",
          )}
        >
          {!isCollapsed && (
            <span className="text-xs">
              Contraer panel
            </span>
          )}

          {isCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

export function BackofficeSidebar() {
  const {
    isMobileOpen,
    isCollapsed,
    closeMobile,
  } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-white/6 bg-[#070708]/95 backdrop-blur-xl transition-[width] duration-300 lg:block",
          isCollapsed ? "w-20" : "w-72",
        )}
      >
        <SidebarContent />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={closeMobile}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <aside className="relative h-full w-[min(88vw,320px)] border-r border-white/8 bg-[#070708] shadow-2xl">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={closeMobile}
              className="absolute top-5 right-4 z-10 flex size-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-zinc-400"
            >
              <X size={18} />
            </button>

            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
