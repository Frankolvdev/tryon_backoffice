import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

interface RouteContext {
  params: Promise<{
    segments: string[];
  }>;
}

async function buildPath(
  context: RouteContext,
): Promise<string> {
  const { segments } = await context.params;

  return (
    "/api/v1/admin/notification-center/" +
    segments
      .map(encodeURIComponent)
      .join("/")
  );
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const path = await buildPath(context);

  return forwardAdminRequest({
    backendPath: `${path}${request.nextUrl.search}`,
    method: "GET",
    request,
  });
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath: await buildPath(context),
    method: "POST",
    request,
  });
}
