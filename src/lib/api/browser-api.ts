import type {
  ApiErrorResponse,
  ApiValidationError,
} from "@/types/auth";

export class BrowserApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message);

    this.name = "BrowserApiError";
    this.status = status;
    this.code = code;
  }
}

interface ExtendedApiErrorResponse
  extends ApiErrorResponse {
  success?: boolean;

  error?: {
    code?: string;
    message?: string;
    translation_key?: string;
    locale?: string;
  };
}

function formatValidationErrors(
  errors: ApiValidationError[],
): string {
  return errors
    .map((error) => error.msg)
    .filter(Boolean)
    .join(" ");
}

function getErrorMessage(
  payload: ExtendedApiErrorResponse,
  status: number,
): string {
  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  if (Array.isArray(payload.detail)) {
    const validationMessage =
      formatValidationErrors(payload.detail);

    if (validationMessage) {
      return validationMessage;
    }
  }

  if (
    typeof payload.error?.message === "string"
  ) {
    return payload.error.message;
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  if (status === 401) {
    return "El correo electrónico o la contraseña son incorrectos.";
  }

  if (status === 403) {
    return "No tienes permisos para realizar esta acción.";
  }

  if (status >= 500) {
    return "El servidor no pudo procesar la solicitud.";
  }

  return "No fue posible completar la solicitud.";
}

export async function browserApiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(
    options.headers,
  );

  headers.set("Accept", "application/json");

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  let response: Response;

  try {
    response = await fetch(path, {
      ...options,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new BrowserApiError(
      "No fue posible conectar con el backoffice local.",
      503,
    );
  }

  const contentType =
    response.headers
      .get("content-type")
      ?.toLowerCase() ?? "";

  if (
    !contentType.includes(
      "application/json",
    )
  ) {
    const responseText =
      await response.text();

    console.error(
      `[Backoffice API] ${options.method ?? "GET"} ${path} returned non-JSON content.`,
      {
        status: response.status,
        contentType,
        responsePreview:
          responseText.slice(0, 500),
      },
    );

    throw new BrowserApiError(
      response.status === 404
        ? `La ruta interna ${path} no fue encontrada por Next.js.`
        : `La ruta interna ${path} devolvió una respuesta inesperada.`,
      response.status,
    );
  }

  let payload: T &
    ExtendedApiErrorResponse;

  try {
    payload =
      (await response.json()) as T &
        ExtendedApiErrorResponse;
  } catch {
    throw new BrowserApiError(
      `La respuesta de ${path} no contiene JSON válido.`,
      response.status,
    );
  }

  if (!response.ok) {
    throw new BrowserApiError(
      getErrorMessage(
        payload,
        response.status,
      ),
      response.status,
      payload.code ??
        payload.error?.code,
    );
  }

  return payload;
}