import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { backendRequest } from "@/lib/server/backend-api";
import { getAccessToken } from "@/lib/server/auth-cookies";
import { createRouteErrorResponse } from "@/lib/server/route-error";

import type { AnalyticsResponse } from "@/types/admin";

function normalizeDays(value: string | null): number {
  const parsedValue = Number.parseInt(value ?? "30", 10);

  if (!Number.isFinite(parsedValue)) {
    return 30;
  }

  return Math.min(Math.max(parsedValue, 1), 365);
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    await getAuthenticatedAdmin();

    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        {
          detail:
            "No se encontró una sesión administrativa activa.",
        },
        {
          status: 401,
        },
      );
    }

    const days = normalizeDays(
      request.nextUrl.searchParams.get("days"),
    );

    const analytics =
      await backendRequest<AnalyticsResponse>(
        `/api/v1/admin/analytics?days=${days}`,
        {
          method: "GET",
          accessToken,
        },
      );

    return NextResponse.json(analytics);
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}