import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { getAccessToken } from "@/lib/server/auth-cookies";
import { serverConfig } from "@/config/server";

export async function GET() {
  await getAuthenticatedAdmin();
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ detail: "Sesión administrativa requerida." }, { status: 401 });

  const response = await fetch(`${serverConfig.backendApiUrl}/api/v1/admin/tools-generation/ancestry-assets/export/zip`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({ detail: text || "No se pudo exportar." }, { status: response.status });
  }

  const bytes = await response.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="ancestry-assets.zip"',
    },
  });
}
