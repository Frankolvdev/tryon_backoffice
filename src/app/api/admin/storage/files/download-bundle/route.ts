import { NextRequest, NextResponse } from "next/server";

import { serverConfig } from "@/config/server";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { getAccessToken } from "@/lib/server/auth-cookies";

export async function GET(request: NextRequest): Promise<Response> {
  await getAuthenticatedAdmin();
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ detail: "Sesión administrativa no disponible." }, { status: 401 });
  }

  const ids = request.nextUrl.searchParams.get("ids") ?? "";
  const backendUrl = `${serverConfig.backendApiUrl}/api/v1/admin/storage/files/download-bundle?ids=${encodeURIComponent(ids)}`;
  const response = await fetch(backendUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ detail: detail || "No fue posible descargar los recursos." }, { status: response.status });
  }

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-disposition"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("Cache-Control", "private, no-store");
  return new Response(response.body, { status: 200, headers });
}
