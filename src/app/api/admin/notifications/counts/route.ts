import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { backendRequest } from "@/lib/server/backend-api";
import { getAccessToken } from "@/lib/server/auth-cookies";
import { createRouteErrorResponse } from "@/lib/server/route-error";

import type { AdminNotificationCountResponse } from "@/types/admin";

export async function GET(): Promise<NextResponse> {
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

    const counts =
      await backendRequest<AdminNotificationCountResponse>(
        "/api/v1/admin/notification-center/counts",
        {
          method: "GET",
          accessToken,
        },
      );

    return NextResponse.json(counts);
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}