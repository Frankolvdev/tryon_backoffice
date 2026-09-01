import http from "node:http";
import https from "node:https";
import { once } from "node:events";

import { NextRequest, NextResponse } from "next/server";

import { serverConfig } from "@/config/server";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { forwardAdminRequest } from "@/lib/server/admin-route-proxy";
import { getAccessToken } from "@/lib/server/auth-cookies";
import { createRouteErrorResponse } from "@/lib/server/route-error";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ segments?: string[] }>;
};

type UpstreamResponse = {
  status: number;
  contentType: string | null;
  body: Buffer;
};

async function backendPath(
  request: NextRequest,
  context: RouteContext,
): Promise<string> {
  const { segments = [] } = await context.params;
  const suffix = segments.length
    ? `/${segments.map(encodeURIComponent).join("/")}`
    : "";

  return `/api/v1/admin/modal-file-manager${suffix}${request.nextUrl.search}`;
}

async function forwardModalUpload(
  target: URL,
  headers: Headers,
  body: ReadableStream<Uint8Array> | null,
): Promise<UpstreamResponse> {
  const transport = target.protocol === "https:" ? https : http;

  return await new Promise<UpstreamResponse>((resolve, reject) => {
    const upstream = transport.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || undefined,
        method: "POST",
        path: `${target.pathname}${target.search}`,
        headers: Object.fromEntries(headers.entries()),
        // Large Modal model uploads can legitimately take longer than five minutes.
        // Native Node HTTP has no Undici/fetch response-header deadline here.
        timeout: 0,
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer | Uint8Array | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on("end", () => {
          resolve({
            status: response.statusCode || 502,
            contentType:
              typeof response.headers["content-type"] === "string"
                ? response.headers["content-type"]
                : null,
            body: Buffer.concat(chunks),
          });
        });
      },
    );

    upstream.on("error", reject);

    void (async () => {
      try {
        if (!body) {
          upstream.end();
          return;
        }
        const reader = body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value?.byteLength) continue;
          if (!upstream.write(Buffer.from(value))) {
            await once(upstream, "drain");
          }
        }
        upstream.end();
      } catch (error) {
        upstream.destroy(error instanceof Error ? error : new Error(String(error)));
      }
    })();
  });
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

    const target = new URL(
      `${serverConfig.backendApiUrl}${await backendPath(request, context)}`,
    );
    const response = await forwardModalUpload(target, headers, request.body);

    const responseHeaders = new Headers();
    if (response.contentType) {
      responseHeaders.set("Content-Type", response.contentType);
    }

    return new NextResponse(response.body, {
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
