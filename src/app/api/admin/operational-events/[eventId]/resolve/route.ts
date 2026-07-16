import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

interface RouteContext {
  params: Promise<{
    eventId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { eventId } = await context.params;

  return forwardAdminRequest({
    backendPath:
      `/api/v1/admin/operational-events/${encodeURIComponent(
        eventId,
      )}/resolve`,
    method: "POST",
    request,
  });
}
