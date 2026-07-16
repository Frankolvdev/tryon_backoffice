# 10C — Notification Delivery History

## Backend verificado

El backend no expone un listado global de todas las entregas.

Expone exclusivamente:

```text
GET /api/v1/admin/notification-center/{notification_id}/deliveries
POST /api/v1/admin/notification-deliveries/{delivery_id}/retry
```

Por eso esta pantalla trabaja correctamente **por notificación**, sin inventar un endpoint global.

## Datos reales mostrados

- Delivery ID.
- Notification ID.
- Channel ID.
- Usuario destinatario.
- Tipo de canal.
- Destino enmascarado por el backend.
- Estado.
- Intentos y máximo.
- Provider message ID.
- Código HTTP/proveedor.
- Tipo y mensaje de error.
- Respuesta del proveedor.
- Fecha programada.
- Inicio de procesamiento.
- Entrega.
- Fallo.
- Próximo reintento.
- Creación y actualización.

## Acciones reales

- Consultar entregas de una notificación.
- Abrir detalle completo.
- Reintentar una entrega no exitosa.

El backend rechaza reintentar una entrega ya completada.

## Ruta

```text
/dashboard/notifications/deliveries
```

## Instalación

Extrae directamente sobre:

```text
F:\PROYECTOS PERSONALES\TRYON\backoffice
```

Luego ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Git

```powershell
git add .
git commit -m "Notifications - Delivery history and retry"
git push
```
