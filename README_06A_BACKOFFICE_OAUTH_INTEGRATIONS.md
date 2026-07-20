# 06A BackOffice OAuth Integrations

Primer incremento para administrar OAuth desde la pestaña **Integraciones**.

## Incluye

- Google OAuth, GitHub OAuth, Facebook OAuth y Apple OAuth como proveedores administrables.
- GitHub OAuth agregado al catálogo y a los tipos del BackOffice.
- Acceso al editor desde las tarjetas de Integraciones.
- Campos específicos de OAuth:
  - Client ID
  - Client Secret
  - URI de redirección autorizada
- Oculta campos no aplicables a OAuth, como URL base y Webhook Secret.
- Conserva los endpoints reales existentes del backend:
  - GET `/api/admin/integrations/{provider}`
  - PATCH `/api/admin/integrations/{provider}`
  - POST `/api/admin/integrations/{provider}/health`

## Validación

`npx tsc --noEmit` completó sin errores.

El build de Next.js fue iniciado, pero el entorno de validación no pudo descargar las fuentes Geist desde Google Fonts. No se detectaron errores TypeScript del paquete.
