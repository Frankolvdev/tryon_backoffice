import { NextResponse } from "next/server";

import { getAccessToken } from "@/lib/server/auth-cookies";
import { backendRequest } from "@/lib/server/backend-api";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { createRouteErrorResponse } from "@/lib/server/route-error";

import type { AdminMfaStatusResponse } from "@/types/auth";

export async function GET(): Promise<NextResponse> {
  try {
    await getAuthenticatedAdmin();

    const accessToken = await getAccessToken();

    const status =
      await backendRequest<AdminMfaStatusResponse>(
        "/api/v1/admin-mfa/status",
        {
          method: "GET",
          accessToken,
        },
      );

    return NextResponse.json(status);
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}