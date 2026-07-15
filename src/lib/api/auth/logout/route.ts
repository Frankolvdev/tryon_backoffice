import { NextResponse } from "next/server";

import { backendRequest } from "@/lib/server/backend-api";
import {
  clearAuthenticationCookies,
  getRefreshToken,
} from "@/lib/server/auth-cookies";

export async function POST(): Promise<NextResponse> {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await backendRequest("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });
    } catch (error) {
      console.error(
        "Backend logout failed; local session will still be removed.",
        error,
      );
    }
  }

  await clearAuthenticationCookies();

  return NextResponse.json({
    success: true,
    message: "Sesión cerrada correctamente.",
  });
}