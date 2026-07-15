"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AdminSessionResponse,
  User,
} from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  refreshSession: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(
  null,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession =
    useCallback(async (): Promise<User | null> => {
      try {
        const session =
          await browserApiRequest<AdminSessionResponse>(
            "/api/auth/session",
          );

        setUser(session.user);

        return session.user;
      } catch {
        setUser(null);

        return null;
      } finally {
        setIsLoading(false);
      }
    }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await browserApiRequest("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setUser(null);
      router.replace("/login");
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      refreshSession,
      logout,
    }),
    [user, isLoading, refreshSession, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}