import { serverConfig } from "@/config/server";

interface BackendRequestOptions extends RequestInit {
  accessToken?: string | null;
}

export class BackendApiError extends Error {
  public readonly status: number;
  public readonly payload: unknown;

  constructor(
    message: string,
    status: number,
    payload: unknown,
  ) {
    super(message);

    this.name = "BackendApiError";
    this.status = status;
    this.payload = payload;
  }
}

function extractBackendMessage(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "detail" in payload
  ) {
    const detail = payload.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item &&
            typeof item.msg === "string"
          ) {
            return item.msg;
          }

          return "Error de validación.";
        })
        .join(" ");
    }
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return "El backend no pudo procesar la solicitud.";
}

export async function backendRequest<T>(
  path: string,
  options: BackendRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${options.accessToken}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${serverConfig.backendApiUrl}${path}`,
      {
        ...options,
        headers,
        cache: "no-store",
      },
    );
  } catch {
    throw new BackendApiError(
      "No fue posible conectar con el backend local.",
      503,
      null,
    );
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new BackendApiError(
      extractBackendMessage(payload),
      response.status,
      payload,
    );
  }

  return payload as T;
}