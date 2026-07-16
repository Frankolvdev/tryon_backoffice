import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

interface RouteContext {
  params: Promise<{
    translationId: string;
  }>;
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { translationId } =
    await context.params;

  return forwardAdminRequest({
    backendPath:
      `/api/v1/admin/i18n/translations/${encodeURIComponent(
        translationId,
      )}`,
    method: "PUT",
    request,
  });
}
