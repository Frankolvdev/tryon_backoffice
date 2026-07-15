# 04 — Integrations Communications

## Backend revisado

El proveedor de comunicaciones realmente registrado en `IntegrationProvider` es:

- SMTP

Telegram, Slack y Web Push aparecen como variables o subsistemas de notificaciones, pero no están registrados como proveedores administrables dentro de `integration_configs`. Por eso este ZIP no inventa tarjetas ni rutas para ellos.

## Endpoints reales utilizados

- `GET /api/v1/admin/integrations/smtp`
- `PATCH /api/v1/admin/integrations/smtp`
- `POST /api/v1/admin/integrations/smtp/health`

## Campos SMTP reales

El servicio `smtp_email_service` utiliza:

- `config.host`
- `config.port`
- `config.use_tls`
- `config.from_email`
- `config.from_name`
- `api_key` como username SMTP
- `api_secret` como contraseña SMTP

## Incluye

- Editor especializado de SMTP.
- Activar o desactivar.
- Estado administrativo.
- Host.
- Puerto.
- STARTTLS.
- Correo remitente.
- Nombre remitente.
- Username.
- Contraseña.
- Conservación de credenciales existentes.
- Health check real contra el servidor SMTP.
- Habilitación de SMTP en el panel general.
- Responsive.
- Sin dependencias nuevas.

## No incluido

No existe un endpoint administrativo específico para enviar un correo de prueba desde este módulo. El health check sí abre conexión, aplica STARTTLS cuando corresponde y autentica con las credenciales configuradas.

Tampoco se incluyen Telegram, Slack ni Web Push porque no forman parte del enum `IntegrationProvider` ni de los endpoints genéricos de integraciones actuales.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre `/dashboard/integrations`.
2. Entra a SMTP.
3. Configura host, puerto y remitente.
4. Guarda username y contraseña.
5. Habilita la integración.
6. Ejecuta `Comprobar salud`.
7. Prueba credenciales incorrectas para confirmar el estado de error.
8. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Integrations - ZIP 04 Communications SMTP"
git push
```
