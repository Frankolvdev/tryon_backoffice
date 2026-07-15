"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SidebarContextValue {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleCollapsed: () => void;
}

const SidebarContext =
  createContext<SidebarContextValue | null>(null);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({
  children,
}: SidebarProviderProps) {
  const [isMobileOpen, setIsMobileOpen] =
    useState(false);

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const value = useMemo<SidebarContextValue>(
    () => ({
      isMobileOpen,
      isCollapsed,
      openMobile: () => setIsMobileOpen(true),
      closeMobile: () => setIsMobileOpen(false),
      toggleCollapsed: () =>
        setIsCollapsed((current) => !current),
    }),
    [isMobileOpen, isCollapsed],
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error(
      "useSidebar must be used inside SidebarProvider.",
    );
  }

  return context;
}