# 11A — Support Dashboard + Notification Bell

## Backend revisado

Soporte administrativo usa exclusivamente:

- `GET /api/v1/admin/support-tickets`
- `GET /api/v1/admin/support-tickets/{ticket_id}`
- `PATCH /api/v1/admin/support-tickets/{ticket_id}`

Este primer ZIP usa los dos endpoints de lectura. La edición se integrará en 11B.

El contrato real contiene:

- ID;
- user ID;
- subject;
- message;
- status;
- priority;
- admin notes;
- assigned admin user ID;
- created at;
- updated at.

## Soporte incluido

Ruta:

`/dashboard/support`

Incluye:

- total;
- abiertos;
- en proceso;
- resueltos;
- urgentes;
- búsqueda;
- filtro por estado;
- filtro por prioridad;
- listado;
- panel de detalle;
- notas internas existentes;
- administrador asignado;
- acceso desde Administración → Soporte;
- acceso desde Sistema → Tickets.

Los contadores se calculan sobre los tickets cargados, porque el backend no expone un endpoint específico de estadísticas ni filtros de estado/prioridad.

## Campana de notificaciones

Se reemplaza:

`src/components/backoffice/notification-button.tsx`

Ahora:

- muestra el número real sin leer;
- abre un desplegable;
- carga hasta seis notificaciones recientes no leídas;
- permite marcarlas como leídas;
- actualiza el contador local;
- permite actualizar manualmente;
- enlaza al Centro de Notificaciones;
- consulta cada 60 segundos;
- conserva el último estado exitoso si el backend está temporalmente detenido;
- evita que una falla de notificaciones bloquee el BackOffice.

Usa los endpoints reales ya integrados:

- `GET /api/admin/notifications/counts`
- `GET /api/admin/notifications`
- `POST /api/admin/notifications/{id}/read`

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

1. Abre `/dashboard/support`.
2. Revisa contadores y filtros.
3. Selecciona un ticket.
4. Abre la campana.
5. Marca una notificación como leída.
6. Confirma que disminuye el contador.
7. Abre “Ver todas las notificaciones”.
8. Apaga temporalmente el backend y confirma que el BackOffice no se bloquea.

## Git

```powershell
git add .
git commit -m "Support - Dashboard foundation and notification bell"
git push
```
