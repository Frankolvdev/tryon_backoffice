import { NextResponse } from "next/server";

import { backendRequest } from "@/lib/server/backend-api";
import {
  clearAuthenticationCookies,
  getRefreshToken,
} from "@/lib/server/auth-cookies";

export async function POST(): Promise<NextResponse> {
  const refreshToken = await getRefreshToken();

  try {
    if (refreshToken) {
      await backendRequest(
        "/api/v1/auth/logout",
        {
          method: "POST",
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        },
      );
    }
  } catch {
    // Logout must always clear local cookies, even when the
    // backend token was already expired or unavailable.
  } finally {
    await clearAuthenticationCookies();
  }

  return NextResponse.json({
    success: true,
    message: "Sesión cerrada correctamente.",
  });
}
