import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/backend-api";

function detectErrorCode(message: string): string | undefined {
  const normalizedMessage = message.toLowerCase();

  const mentionsMfa =
    normalizedMessage.includes("mfa") ||
    normalizedMessage.includes("2fa") ||
    normalizedMessage.includes("otp") ||
    normalizedMessage.includes("authenticator") ||
    normalizedMessage.includes("código requerido") ||
    normalizedMessage.includes("codigo requerido");

  return mentionsMfa ? "MFA_REQUIRED" : undefined;
}

export function createRouteErrorResponse(
  error: unknown,
): NextResponse {
  if (error instanceof BackendApiError) {
    return NextResponse.json(
      {
        detail: error.message,
        code: detectErrorCode(error.message),
      },
      {
        status: error.status,
      },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      detail: "Ocurrió un error inesperado.",
    },
    {
      status: 500,
    },
  );
}