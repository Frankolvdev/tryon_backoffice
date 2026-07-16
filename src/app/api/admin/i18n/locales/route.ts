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
      `/api/v1/admin/i18n/locales${request.nextUrl.search}`,
    method: "GET",
    request,
  });
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath:
      "/api/v1/admin/i18n/locales",
    method: "POST",
    request,
  });
}
