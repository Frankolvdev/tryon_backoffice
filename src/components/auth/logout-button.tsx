"use client";

import { useState } from "react";

import {
  LoaderCircle,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";

export function LogoutButton() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoggingOut}
      onClick={() => void handleLogout()}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 text-sm text-zinc-400 transition hover:border-red-500/20 hover:bg-red-950/20 hover:text-white disabled:opacity-50"
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
  );
}