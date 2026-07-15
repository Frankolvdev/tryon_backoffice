"use client";

import type { ReactNode } from "react";

import { Toaster } from "sonner";

import { AuthProvider } from "@/components/providers/auth-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <AuthProvider>
      {children}

      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: "#111113",
            border:
              "1px solid rgba(255, 255, 255, 0.08)",
            color: "#f5f5f5",
          },
        }}
      />
    </AuthProvider>
  );
}