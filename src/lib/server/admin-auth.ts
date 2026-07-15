import {
  backendRequest,
  BackendApiError,
} from "@/lib/server/backend-api";
import {
  clearAuthenticationCookies,
  getAccessToken,
  getRefreshToken,
  setAuthenticationCookies,
} from "@/lib/server/auth-cookies";

import type {
  TokenResponse,
  User,
} from "@/types/auth";

export function isAdministrativeUser(
  user: User,
): boolean {
  return (
    user.role === "admin" ||
    user.role === "superadmin"
  );
}

async function fetchCurrentUser(
  accessToken: string,
): Promise<User> {
  return backendRequest<User>(
    "/api/v1/users/me",
    {
      method: "GET",
      accessToken,
    },
  );
}

async function refreshAuthentication(): Promise<TokenResponse> {
  const refreshToken =
    await getRefreshToken();

  if (!refreshToken) {
    throw new BackendApiError(
      "La sesión administrativa no está disponible.",
      401,
      null,
    );
  }

  const tokens =
    await backendRequest<TokenResponse>(
      "/api/v1/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      },
    );

  await setAuthenticationCookies(tokens);

  return tokens;
}

async function refreshOrClearAuthentication(): Promise<TokenResponse> {
  try {
    return await refreshAuthentication();
  } catch (error) {
    if (
      error instanceof BackendApiError &&
      (
        error.status === 400 ||
        error.status === 401 ||
        error.status === 403
      )
    ) {
      await clearAuthenticationCookies();

      throw new BackendApiError(
        "La sesión ha expirado. Inicia sesión nuevamente.",
        401,
        error.payload,
      );
    }

    throw error;
  }
}

export async function getAuthenticatedAdmin(): Promise<User> {
  let accessToken =
    await getAccessToken();

  if (!accessToken) {
    const tokens =
      await refreshOrClearAuthentication();

    accessToken = tokens.access_token;
  }

  let user: User;

  try {
    user = await fetchCurrentUser(
      accessToken,
    );
  } catch (error) {
    if (
      !(
        error instanceof BackendApiError
      ) ||
      error.status !== 401
    ) {
      throw error;
    }

    const tokens =
      await refreshOrClearAuthentication();

    user = await fetchCurrentUser(
      tokens.access_token,
    );
  }

  if (
    !isAdministrativeUser(user)
  ) {
    await clearAuthenticationCookies();

    throw new BackendApiError(
      "Esta cuenta no tiene acceso al backoffice.",
      403,
      null,
    );
  }

  if (
    !user.is_active ||
    user.status !== "active"
  ) {
    await clearAuthenticationCookies();

    throw new BackendApiError(
      "La cuenta administrativa no está activa.",
      403,
      null,
    );
  }

  return user;
}
