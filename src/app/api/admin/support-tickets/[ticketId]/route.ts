import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

interface RouteContext {
  params: Promise<{
    ticketId: string;
  }>;
}

async function backendPath(
  context: RouteContext,
): Promise<string> {
  const { ticketId } = await context.params;

  return `/api/v1/admin/support-tickets/${encodeURIComponent(
    ticketId,
  )}`;
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath:
      await backendPath(context),
    method: "GET",
    request,
  });
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath:
      await backendPath(context),
    method: "PATCH",
    request,
  });
}
