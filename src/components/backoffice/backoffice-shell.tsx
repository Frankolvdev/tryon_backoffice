"use client";

import type { ReactNode } from "react";

import { BackofficeSidebar } from "@/components/backoffice/backoffice-sidebar";
import { BackofficeTopbar } from "@/components/backoffice/backoffice-topbar";
import { SidebarProvider } from "@/components/backoffice/sidebar-provider";
import { cn } from "@/lib/utils";

import { useSidebar } from "@/components/backoffice/sidebar-provider";

interface BackofficeShellContentProps {
  children: ReactNode;
}

function BackofficeShellContent({
  children,
}: BackofficeShellContentProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#040405]">
      <BackofficeSidebar />

      <div
        className={cn(
          "min-h-screen transition-[padding] duration-300",
          isCollapsed
            ? "lg:pl-20"
            : "lg:pl-72",
        )}
      >
        <BackofficeTopbar />

        <main className="luxia-grid-background min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

interface BackofficeShellProps {
  children: ReactNode;
}

export function BackofficeShell({
  children,
}: BackofficeShellProps) {
  return (
    <SidebarProvider>
      <BackofficeShellContent>
        {children}
      </BackofficeShellContent>
    </SidebarProvider>
  );
}