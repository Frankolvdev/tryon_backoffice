import axios from "axios";

import type { ApiErrorResponse, ApiValidationError } from "@/types/auth";

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: ApiErrorResponse;

  constructor(
    message: string,
    status = 500,
    details?: ApiErrorResponse,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function formatValidationErrors(errors: ApiValidationError[]): string {
  return errors
    .map((error) => {
      const field = error.loc
        .filter((part) => part !== "body")
        .join(".");

      return field ? `${field}: ${error.msg}` : error.msg;
    })
    .join(" ");
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return new ApiError(
      "Ocurrió un error inesperado. Intenta nuevamente.",
    );
  }

  const status = error.response?.status ?? 500;
  const data = error.response?.data;

  if (Array.isArray(data?.detail)) {
    return new ApiError(
      formatValidationErrors(data.detail),
      status,
      data,
    );
  }

  if (typeof data?.detail === "string") {
    return new ApiError(data.detail, status, data);
  }

  if (typeof data?.message === "string") {
    return new ApiError(data.message, status, data);
  }

  if (status === 401) {
    return new ApiError(
      "Las credenciales proporcionadas no son válidas.",
      status,
      data,
    );
  }

  if (status === 403) {
    return new ApiError(
      "No tienes permisos para realizar esta acción.",
      status,
      data,
    );
  }

  if (status >= 500) {
    return new ApiError(
      "El servidor no pudo procesar la solicitud.",
      status,
      data,
    );
  }

  return new ApiError(
    "No fue posible completar la solicitud.",
    status,
    data,
  );
}