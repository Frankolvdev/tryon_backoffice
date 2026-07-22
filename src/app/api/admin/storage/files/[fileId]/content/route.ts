import { NextRequest, NextResponse } from "next/server";

import { serverConfig } from "@/config/server";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { getAccessToken } from "@/lib/server/auth-cookies";

interface RouteContext {
  params: Promise<{ fileId: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  await getAuthenticatedAdmin();
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ detail: "Sesión administrativa no disponible." }, { status: 401 });
  }

  const { fileId } = await context.params;
  const download = request.nextUrl.searchParams.get("download") === "1";
  const backendUrl = `${serverConfig.backendApiUrl}/api/v1/admin/storage/files/${encodeURIComponent(fileId)}/content?download=${download}`;
  const response = await fetch(backendUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    redirect: "follow",
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { detail: detail || "No fue posible leer el archivo." },
      { status: response.status },
    );
  }

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-disposition", "cache-control"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("Cache-Control", "private, no-store");
  return new Response(response.body, { status: 200, headers });
}
