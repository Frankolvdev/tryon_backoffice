import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { createRouteErrorResponse } from "@/lib/server/route-error";

import type { AdminSessionResponse } from "@/types/auth";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await getAuthenticatedAdmin();

    const response: AdminSessionResponse = {
      authenticated: true,
      user,
    };

    return NextResponse.json(response);
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}