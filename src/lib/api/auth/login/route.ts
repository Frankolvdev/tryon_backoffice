import { NextResponse } from "next/server";

import {
  backendRequest,
  BackendApiError,
} from "@/lib/server/backend-api";
import {
  clearAuthenticationCookies,
  setAuthenticationCookies,
} from "@/lib/server/auth-cookies";
import { isAdministrativeUser } from "@/lib/server/admin-auth";
import { createRouteErrorResponse } from "@/lib/server/route-error";

import type {
  AdminLoginResponse,
  LoginRequest,
  TokenResponse,
  User,
} from "@/types/auth";

export async function POST(
  request: Request,
): Promise<NextResponse> {
  try {
    const payload = (await request.json()) as LoginRequest;

    const tokens = await backendRequest<TokenResponse>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    const user = await backendRequest<User>(
      "/api/v1/users/me",
      {
        method: "GET",
        accessToken: tokens.access_token,
      },
    );

    if (!isAdministrativeUser(user)) {
      try {
        await backendRequest("/api/v1/auth/logout", {
          method: "POST",
          body: JSON.stringify({
            refresh_token: tokens.refresh_token,
          }),
        });
      } catch {
        // The local cookies are still cleared below.
      }

      await clearAuthenticationCookies();

      throw new BackendApiError(
        "Esta cuenta es válida, pero no tiene acceso administrativo.",
        403,
        null,
      );
    }

    if (!user.is_active || user.status !== "active") {
      await clearAuthenticationCookies();

      throw new BackendApiError(
        "La cuenta administrativa está suspendida o inactiva.",
        403,
        null,
      );
    }

    await setAuthenticationCookies(tokens);

    const response: AdminLoginResponse = {
      success: true,
      mfa_setup_required: tokens.mfa_setup_required,
      user,
    };

    return NextResponse.json(response);
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}