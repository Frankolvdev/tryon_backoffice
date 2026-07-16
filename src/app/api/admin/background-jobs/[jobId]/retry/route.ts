import {
  NextRequest,
  NextResponse,
} from "next/server";

import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";

interface RouteContext {
  params: Promise<{
    jobId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { jobId } = await context.params;

  return forwardAdminRequest({
    backendPath:
      `/api/v1/admin/background-jobs/${encodeURIComponent(jobId)}/retry`,
    method: "POST",
    request,
  });
}
