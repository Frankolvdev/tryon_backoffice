import { NextRequest, NextResponse } from "next/server";

import { serverConfig } from "@/config/server";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";
import { getAccessToken } from "@/lib/server/auth-cookies";
import { createRouteErrorResponse } from "@/lib/server/route-error";

type RouteContext = {
  params: Promise<{ segments?: string[] }>;
};

async function backendPath(
  request: NextRequest,
  context: RouteContext,
): Promise<string> {
  const { segments = [] } = await context.params;
  const suffix = segments.length
    ? `/${segments.map(encodeURIComponent).join("/")}`
    : "";

  return `/api/v1/admin/runpod-file-manager${suffix}${request.nextUrl.search}`;
}

async function streamUpload(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    await getAuthenticatedAdmin();
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { detail: "No se encontró una sesión administrativa activa." },
        { status: 401 },
      );
    }

    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    const contentLength = request.headers.get("content-length");
    const uploadFilename = request.headers.get("x-upload-filename");

    if (contentType) headers.set("Content-Type", contentType);
    if (contentLength) headers.set("Content-Length", contentLength);
    if (uploadFilename) headers.set("X-Upload-Filename", uploadFilename);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(
      `${serverConfig.backendApiUrl}${await backendPath(request, context)}`,
      {
        method: "POST",
        headers,
        body: request.body,
        cache: "no-store",
        duplex: "half",
      } as RequestInit & { duplex: "half" },
    );

    const responseHeaders = new Headers();
    const responseContentType = response.headers.get("content-type");
    if (responseContentType) {
      responseHeaders.set("Content-Type", responseContentType);
    }

    const responseBody = await response.arrayBuffer();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}

async function proxy(
  request: NextRequest,
  context: RouteContext,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
): Promise<NextResponse> {
  const { segments = [] } = await context.params;

  if (
    method === "POST" &&
    (segments[0] === "upload" || segments[0] === "upload-stream")
  ) {
    return streamUpload(request, context);
  }

  return forwardAdminRequest({
    backendPath: await backendPath(request, context),
    method,
    request,
  });
}

export function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context, "GET");
}

export function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context, "POST");
}

export function PUT(request: NextRequest, context: RouteContext) {
  return proxy(request, context, "PUT");
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(request, context, "PATCH");
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return proxy(request, context, "DELETE");
}
