import { NextRequest, NextResponse } from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const query = request.nextUrl.searchParams.toString();

  return forwardAdminRequest({
    backendPath: `/api/v1/admin/users${
      query ? `?${query}` : ""
    }`,
    method: "GET",
    request,
  });
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath: "/api/v1/admin/users",
    method: "POST",
    request,
  });
}