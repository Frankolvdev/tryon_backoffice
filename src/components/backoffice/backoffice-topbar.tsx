"use client";

import {
  Menu,
  Search,
} from "lucide-react";

import { AdminProfileMenu } from "@/components/backoffice/admin-profile-menu";
import { NotificationButton } from "@/components/backoffice/notification-button";
import { useSidebar } from "@/components/backoffice/sidebar-provider";

export function BackofficeTopbar() {
  const { openMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-white/6 bg-[#050506]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={openMobile}
        className="flex size-10 items-center justify-center rounded-xl border border-white/7 bg-white/[0.025] text-zinc-500 lg:hidden"
      >
        <Menu size={19} />
      </button>

      <div className="relative hidden max-w-xl flex-1 md:block">
        <Search
          size={17}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
        />

        <input
          type="search"
          placeholder="Buscar en el backoffice..."
          disabled
          title="La búsqueda global se habilitará con sus endpoints."
          className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-20 pl-11 text-sm text-zinc-400 outline-none placeholder:text-zinc-700 disabled:cursor-not-allowed"
        />

        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-white/7 bg-white/[0.025] px-2 py-1 text-[10px] text-zinc-700">
          Próximamente
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden h-10 items-center rounded-xl border border-white/7 bg-white/[0.025] px-3 text-xs text-zinc-500 sm:flex">
          ES
        </div>

        <NotificationButton />
        <AdminProfileMenu />
      </div>
    </header>
  );
}