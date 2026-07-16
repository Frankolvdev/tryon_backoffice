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

async function path(
  context: RouteContext,
): Promise<string> {
  const { segments } = await context.params;

  return (
    "/api/v1/admin/notification-preferences/" +
    segments
      .map(encodeURIComponent)
      .join("/")
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath: await path(context),
    method: "POST",
    request,
  });
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath: await path(context),
    method: "PUT",
    request,
  });
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath: await path(context),
    method: "DELETE",
    request,
  });
}
