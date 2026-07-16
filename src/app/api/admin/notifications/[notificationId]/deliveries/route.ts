import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

interface RouteContext {
  params: Promise<{
    notificationId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { notificationId } =
    await context.params;

  return forwardAdminRequest({
    backendPath:
      `/api/v1/admin/notification-center/${encodeURIComponent(
        notificationId,
      )}/deliveries${request.nextUrl.search}`,
    method: "GET",
    request,
  });
}
