"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";

function getInitials(
  fullName: string | null,
  email: string,
): string {
  if (fullName) {
    return fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  return email
    .slice(0, 2)
    .toUpperCase();
}

export function AdminProfileMenu() {
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] =
    useState(false);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
    };
  }, []);

  if (!user) {
    return (
      <div className="flex h-10 items-center gap-3 rounded-xl border border-white/7 bg-white/[0.025] px-3">
        <LoaderCircle
          size={16}
          className="animate-spin text-zinc-600"
        />
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        className="flex h-11 items-center gap-3 rounded-xl border border-white/7 bg-white/[0.025] px-2.5 text-left transition hover:bg-white/[0.05]"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-950/30 text-xs font-semibold text-red-300">
          {getInitials(
            user.full_name,
            user.email,
          )}
        </div>

        <div className="hidden min-w-0 sm:block">
          <p className="max-w-40 truncate text-xs font-medium text-zinc-200">
            {user.full_name ?? user.email}
          </p>

          <p className="mt-0.5 text-[10px] tracking-wide text-zinc-600 uppercase">
            {user.role}
          </p>
        </div>

        <ChevronDown
          size={14}
          className="hidden text-zinc-600 sm:block"
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+10px)] right-0 z-50 w-72 rounded-2xl border border-white/8 bg-[#101012] p-2 shadow-2xl">
          <div className="border-b border-white/6 px-3 py-3">
            <p className="truncate text-sm font-medium text-white">
              {user.full_name ??
                "Administrador"}
            </p>

            <p className="mt-1 truncate text-xs text-zinc-600">
              {user.email}
            </p>
          </div>

          <div className="py-2">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-zinc-500">
              <UserRound size={16} />
              ID de usuario: {user.id}
            </div>

            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-zinc-500">
              <ShieldCheck size={16} />
              Cuenta verificada
            </div>
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() =>
              void handleLogout()
            }
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-red-400 transition hover:bg-red-950/30 hover:text-red-300 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <LogOut size={16} />
            )}

            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}