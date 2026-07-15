import { NextResponse } from "next/server";

import { getAccessToken } from "@/lib/server/auth-cookies";
import { backendRequest } from "@/lib/server/backend-api";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { createRouteErrorResponse } from "@/lib/server/route-error";

import type { AdminMfaOperationResponse } from "@/types/auth";

interface ConfirmMfaRequest {
  code: string;
}

export async function POST(
  request: Request,
): Promise<NextResponse> {
  try {
    await getAuthenticatedAdmin();

    const accessToken = await getAccessToken();
    const payload = (await request.json()) as ConfirmMfaRequest;

    const result =
      await backendRequest<AdminMfaOperationResponse>(
        "/api/v1/admin-mfa/confirm",
        {
          method: "POST",
          accessToken,
          body: JSON.stringify({
            code: payload.code,
          }),
        },
      );

    return NextResponse.json(result);
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}