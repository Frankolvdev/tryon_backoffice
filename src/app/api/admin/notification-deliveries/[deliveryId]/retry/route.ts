import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

interface RouteContext {
  params: Promise<{
    deliveryId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { deliveryId } = await context.params;

  return forwardAdminRequest({
    backendPath:
      `/api/v1/admin/notification-deliveries/${encodeURIComponent(
        deliveryId,
      )}/retry`,
    method: "POST",
    request,
  });
}
