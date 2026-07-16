import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath:
      "/api/v1/admin/account-security/settings",
    method: "GET",
    request,
  });
}

export async function PUT(
  request: NextRequest,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath:
      "/api/v1/admin/account-security/settings",
    method: "PUT",
    request,
  });
}
