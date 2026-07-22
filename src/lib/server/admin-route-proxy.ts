import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";
import { backendRequest } from "@/lib/server/backend-api";
import { getAccessToken } from "@/lib/server/auth-cookies";
import { createRouteErrorResponse } from "@/lib/server/route-error";

interface ForwardAdminRequestOptions {
  backendPath: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  request?: NextRequest | Request;
}

async function readRequestBody(
  request: NextRequest | Request | undefined,
): Promise<BodyInit | undefined> {
  if (!request) {
    return undefined;
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const incomingForm = await request.formData();
    const forwardedForm = new FormData();

    incomingForm.forEach((value, key) => {
      if (typeof value === "string") {
        forwardedForm.append(key, value);
        return;
      }

      forwardedForm.append(key, value, value.name);
    });

    return forwardedForm;
  }

  const body = await request.text();
  return body.trim() ? body : undefined;
}

function canHaveBody(
  method: ForwardAdminRequestOptions["method"],
): boolean {
  return method === "POST" || method === "PUT" || method === "PATCH";
}

export async function forwardAdminRequest({
  backendPath,
  method,
  request,
}: ForwardAdminRequestOptions): Promise<NextResponse> {
  try {
    await getAuthenticatedAdmin();
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        {
          detail: "No se encontró una sesión administrativa activa.",
        },
        {
          status: 401,
        },
      );
    }

    const body = canHaveBody(method)
      ? await readRequestBody(request)
      : undefined;

    const response = await backendRequest<unknown>(backendPath, {
      method,
      accessToken,
      body,
    });

    return NextResponse.json(response);
  } catch (error) {
    return createRouteErrorResponse(error);
  }
}
