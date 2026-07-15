import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { backendRequest } from "@/lib/server/backend-api";
import { getAccessToken } from "@/lib/server/auth-cookies";
import { createRouteErrorResponse } from "@/lib/server/route-error";

import type { MonitoringResponse } from "@/types/admin";

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

    const monitoring =
      await backendRequest<MonitoringResponse>(
        "/api/v1/admin/monitoring",
        {
          method: "GET",
          accessToken,
        },
      );

    return NextResponse.json(monitoring);
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}