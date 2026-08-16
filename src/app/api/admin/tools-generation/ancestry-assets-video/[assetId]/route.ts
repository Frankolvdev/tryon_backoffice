import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { getAccessToken } from "@/lib/server/auth-cookies";
import { serverConfig } from "@/config/server";

type Context = { params: Promise<{ assetId: string }> };

type Asset = { id: number; video_url: string | null };
type AssetList = { items: Asset[] };

export async function GET(_request: Request, context: Context) {
  await getAuthenticatedAdmin();
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ detail: "Sesión administrativa requerida." }, { status: 401 });

  const { assetId } = await context.params;
  const id = Number(assetId);
  if (!Number.isFinite(id)) return NextResponse.json({ detail: "Asset inválido." }, { status: 400 });

  const listResponse = await fetch(`${serverConfig.backendApiUrl}/api/v1/admin/tools-generation/ancestry-assets`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!listResponse.ok) {
    return NextResponse.json({ detail: "No se pudo consultar el asset." }, { status: listResponse.status });
  }

  const payload = (await listResponse.json()) as AssetList;
  const asset = payload.items.find((item) => item.id === id);
  if (!asset?.video_url) return NextResponse.json({ detail: "Este asset no tiene video." }, { status: 404 });

  const absoluteUrl = asset.video_url.startsWith("http://") || asset.video_url.startsWith("https://")
    ? asset.video_url
    : new URL(asset.video_url, `${serverConfig.backendApiUrl}/`).toString();

  const sameBackend = absoluteUrl.startsWith(serverConfig.backendApiUrl);
  const videoResponse = await fetch(absoluteUrl, {
    headers: sameBackend ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });
  if (!videoResponse.ok) {
    return NextResponse.json({ detail: "No se pudo recuperar el video almacenado." }, { status: videoResponse.status });
  }

  const bytes = await videoResponse.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": videoResponse.headers.get("content-type") || "video/mp4",
      "Cache-Control": "no-store",
    },
  });
}
