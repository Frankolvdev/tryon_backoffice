import { cookies } from "next/headers";

import { serverConfig } from "@/config/server";
import type { TokenResponse } from "@/types/auth";

const isProduction = process.env.NODE_ENV === "production";

export async function setAuthenticationCookies(
  tokens: TokenResponse,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(
    serverConfig.accessCookieName,
    tokens.access_token,
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: serverConfig.accessCookieMaxAge,
    },
  );

  cookieStore.set(
    serverConfig.refreshCookieName,
    tokens.refresh_token,
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: serverConfig.refreshCookieMaxAge,
    },
  );
}

export async function clearAuthenticationCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(serverConfig.accessCookieName, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  cookieStore.set(serverConfig.refreshCookieName, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return (
    cookieStore.get(serverConfig.accessCookieName)?.value ??
    null
  );
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return (
    cookieStore.get(serverConfig.refreshCookieName)?.value ??
    null
  );
}