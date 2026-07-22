import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { backendRequest } from "@/lib/server/backend-api";
import { getAccessToken } from "@/lib/server/auth-cookies";
import { createRouteErrorResponse } from "@/lib/server/route-error";

export async function POST(request: NextRequest, context: { params: Promise<{ moduleId: string }> }) {
  try {
    await getAuthenticatedAdmin();
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ detail: "No se encontró una sesión administrativa activa." }, { status: 401 });
    const { moduleId } = await context.params;
    const incoming = await request.formData();
    const forwarded = new FormData();
    incoming.forEach((value, key) => typeof value === "string" ? forwarded.append(key, value) : forwarded.append(key, value, value.name));
    const response = await backendRequest(`/api/v1/admin/generation-modules/${encodeURIComponent(moduleId)}/executions`, {
      method: "POST", accessToken, body: forwarded,
    });
    return NextResponse.json(response, { status: 202 });
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}
