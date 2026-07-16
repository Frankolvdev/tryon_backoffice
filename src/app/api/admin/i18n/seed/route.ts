import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath:
      "/api/v1/admin/i18n/seed",
    method: "POST",
    request,
  });
}
