import { NextRequest, NextResponse } from "next/server";
import { serverConfig } from "@/config/server";

const allowed = new Set(["logo-small", "logo-medium", "logo-large", "favicon"]);

export async function GET(request: NextRequest, { params }: { params: Promise<{ assetKey: string }> }) {
  const { assetKey } = await params;
  if (!allowed.has(assetKey)) return new NextResponse(null, { status: 404 });
  const query = request.nextUrl.searchParams.toString();
  try {
    const response = await fetch(
      `${serverConfig.backendApiUrl}/api/v1/system/branding/assets/${assetKey}${query ? `?${query}` : ""}`,
      { cache: "no-store" },
    );
    if (!response.ok) return new NextResponse(null, { status: response.status });
    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": response.headers.get("cache-control") ?? "public, max-age=31536000, immutable",
        ...(response.headers.get("etag") ? { ETag: response.headers.get("etag")! } : {}),
      },
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
