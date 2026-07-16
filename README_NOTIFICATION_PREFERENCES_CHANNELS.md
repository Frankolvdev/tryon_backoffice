# 10B — Notification Preferences & Channels

## Backend verificado

Usa exclusivamente:

- `GET /api/v1/admin/notification-preferences`
- `PUT /api/v1/admin/notification-preferences`
- `POST /api/v1/admin/notification-preferences/channels`
- `PUT /api/v1/admin/notification-preferences/channels/{channel_id}`
- `DELETE /api/v1/admin/notification-preferences/channels/{channel_id}`
- `POST /api/v1/admin/notification-preferences/channels/{channel_id}/test`

## Incluye

- Ruta `/dashboard/notifications/preferences`.
- Preferencias personales.
- Prioridad mínima.
- Entrega inmediata, horaria o diaria.
- Zona horaria.
- Horario silencioso.
- Excepción para avisos urgentes.
- Crear canales.
- Editar canales.
- Eliminar canales.
- Probar canales.
- Configuración JSON.
- Tipos de notificación permitidos.
- Sin dependencias nuevas.
- Sin endpoints inventados.

## Nota

El backend admite tipos de canal genéricos. El BackOffice no limita el valor a proveedores inventados. Puedes usar los tipos que realmente tengas configurados, como `email`, `webhook` u otro compatible con tus servicios.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

Abre:

`http://127.0.0.1:3000/dashboard/notifications/preferences`

## Git

```powershell
git add .
git commit -m "Notifications - Preferences and delivery channels"
git push
```
