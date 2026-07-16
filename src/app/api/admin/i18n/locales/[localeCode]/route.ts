import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

interface RouteContext {
  params: Promise<{
    localeCode: string;
  }>;
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { localeCode } = await context.params;

  return forwardAdminRequest({
    backendPath:
      `/api/v1/admin/i18n/locales/${encodeURIComponent(
        localeCode,
      )}`,
    method: "PUT",
    request,
  });
}
