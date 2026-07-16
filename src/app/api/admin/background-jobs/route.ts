import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  return forwardAdminRequest({
    backendPath:
      `/api/v1/admin/background-jobs${request.nextUrl.search}`,
    method: "GET",
    request,
  });
}
