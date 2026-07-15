# 08I — Fix Admin Session Refresh

## Problema corregido

El BackOffice cerraba la sesión inmediatamente cuando desaparecía la cookie del Access Token, aunque la cookie del Refresh Token todavía fuera válida.

El flujo anterior hacía esto:

1. buscaba el Access Token;
2. si no existía, eliminaba ambas cookies;
3. devolvía `401 La sesión ha expirado`.

Por ello, aumentar la duración del JWT del backend no solucionaba todos los cierres de sesión.

## Comportamiento nuevo

Ahora el BackOffice:

1. busca el Access Token;
2. si no existe, intenta renovar la sesión con el Refresh Token;
3. guarda las cookies nuevas;
4. consulta nuevamente `/api/v1/users/me`;
5. solo elimina las cookies cuando el Refresh Token es inválido, expiró o fue rechazado.

También conserva la renovación automática cuando el backend responde `401` por un Access Token vencido.

## Archivo modificado

- `src/lib/server/admin-auth.ts`

## Configuración recomendada en `.env.local`

Mantén:

```env
NEXT_PUBLIC_APP_NAME=LUXIA
NEXT_PUBLIC_APP_DESCRIPTION=AI Virtual Try-On Administration
NEXT_PUBLIC_DEFAULT_LOCALE=es
NEXT_PUBLIC_SUPPORTED_LOCALES=es,en

BACKEND_API_URL=http://127.0.0.1:8001
AUTH_ACCESS_COOKIE_NAME=luxia_admin_access
AUTH_REFRESH_COOKIE_NAME=luxia_admin_refresh
AUTH_ACCESS_COOKIE_MAX_AGE=2592000
AUTH_REFRESH_COOKIE_MAX_AGE=31536000
```

Los tiempos están expresados en segundos:

- `2592000` = 30 días.
- `31536000` = 365 días.

El signo `?` no debe escribirse al final del valor.

## Backend recomendado

La duración del backend debe ser igual o superior a la duración deseada:

```env
ACCESS_TOKEN_EXPIRE_MINUTES=43200
REFRESH_TOKEN_EXPIRE_DAYS=365
```

Después de cambiar estas variables, reinicia el backend.

## Instalación

Extrae directamente sobre el proyecto BackOffice, sin carpeta raíz adicional.

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

Cierra sesión una vez e inicia sesión nuevamente para crear cookies con los nuevos tiempos.

## Git

```powershell
git add .
git commit -m "Auth - Fix admin session refresh"
git push
```
