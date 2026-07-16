# 10A — Notifications Dashboard + Logout Fix

## Backend revisado

Este ZIP usa los endpoints reales de:

`app/api/v1/endpoints/admin/notification_center.py`

### Endpoints utilizados

- `GET /api/v1/admin/notification-center`
- `GET /api/v1/admin/notification-center/counts`
- `POST /api/v1/admin/notification-center/{notification_id}/read`
- `POST /api/v1/admin/notification-center/{notification_id}/archive`
- `POST /api/v1/admin/notification-center/mark-all-read`

### Filtros reales

- `priority`
- `is_read`
- `search`
- `is_archived`
- `skip`
- `limit`

## Dashboard agregado

Ruta:

`/dashboard/notifications`

Incluye:

- total;
- sin leer;
- urgentes;
- requieren acción;
- búsqueda;
- filtros;
- detalle;
- marcar como leída;
- marcar todas como leídas;
- archivar;
- enlace de acción cuando existe;
- estados de carga, error y vacío.

## Fix de logout

Se agrega/reemplaza:

`src/app/api/auth/logout/route.ts`

Ahora el logout siempre devuelve JSON:

```json
{
  "success": true,
  "message": "Sesión cerrada correctamente."
}
```

También limpia las cookies aunque el token remoto ya haya expirado. Esto elimina el error:

`POST /api/auth/logout returned non-JSON content`

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Luego:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre `/dashboard/notifications`.
2. Comprueba los contadores.
3. Filtra por prioridad y estado.
4. Abre una notificación no leída.
5. Archiva una notificación de prueba.
6. Cierra sesión.
7. Confirma que no aparece el error de respuesta no JSON.

## Git

```powershell
git add .
git commit -m "Notifications - Dashboard foundation and logout fix"
git push
```
