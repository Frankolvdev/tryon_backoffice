import { NextResponse } from "next/server";

import { getAccessToken } from "@/lib/server/auth-cookies";
import { backendRequest } from "@/lib/server/backend-api";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { createRouteErrorResponse } from "@/lib/server/route-error";

import type { AdminMfaSetupResponse } from "@/types/auth";

export async function POST(): Promise<NextResponse> {
  try {
    await getAuthenticatedAdmin();

    const accessToken = await getAccessToken();

    const setup =
      await backendRequest<AdminMfaSetupResponse>(
        "/api/v1/admin-mfa/setup",
        {
          method: "POST",
          accessToken,
        },
      );

    return NextResponse.json(setup);
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}