# 06B — Google OAuth completo en Integraciones

Este paquete agrega un editor especializado para Google OAuth dentro de:

`Dashboard > Integraciones > Google OAuth`

## Incluye

- Client ID y Client Secret compatibles con el backend actual.
- URI de redirección guardada en `config.redirect_uri`.
- Activación/desactivación real mediante `is_enabled` y `status`.
- Validación de Client ID de Google y URI HTTP/HTTPS.
- Conservación segura de credenciales existentes cuando los campos se dejan vacíos.
- Estado visual: incompleto, configurado, deshabilitado o disponible.
- Valores copiables para Google Cloud Console.
- Scopes reales usados por el backend: `openid email profile`.

## URI local esperada

`http://127.0.0.1:8001/api/v1/oauth/google/callback`

## Origen local del AppWeb

`http://localhost:3003`
