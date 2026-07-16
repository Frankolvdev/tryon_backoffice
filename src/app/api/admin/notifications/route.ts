import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

function backendPath(
  request: NextRequest,
): string {
  return `/api/v1/admin/notification-center${request.nextUrl.search}`;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath: backendPath(request),
    method: "GET",
    request,
  });
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath: "/api/v1/admin/notification-center",
    method: "POST",
    request,
  });
}
