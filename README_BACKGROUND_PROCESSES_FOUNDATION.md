# 12A — Procesos en segundo plano

## Backend revisado

Este ZIP usa exclusivamente endpoints reales:

- `GET /api/v1/admin/background-jobs`
- `GET /api/v1/admin/background-jobs/{job_id}`
- `GET /api/v1/admin/background-job-operations/metrics`

El backend también ofrece cancelar, reintentar, actualizar progreso, mantenimiento, handlers, intentos y dependencias. Esas operaciones se integrarán en los siguientes ZIPs del módulo.

## Diferencia con Trabajos de IA

- **Trabajos de IA** administra trabajos específicos de Try-On, RunPod y ComfyUI.
- **Procesos en segundo plano** muestra cualquier proceso asíncrono de la plataforma, incluidos billing, notificaciones, mantenimiento e integraciones.

## Incluye

- Dashboard general.
- Métricas reales del backend.
- Total, en cola, ejecutándose, completados, fallidos, reintentando y dead letter.
- Listado de jobs.
- Búsqueda.
- Filtro por estado.
- Filtro por cola.
- Filtro por modo de ejecución.
- Progreso.
- Intentos.
- Worker.
- Detalle completo.
- Errores.
- Conteo de intentos y dependencias.
- Navegación habilitada.
- Cambio de nombre de “Colas y procesos” a “Procesos en segundo plano”.
- Eliminación de la entrada redundante “Sistema → Tickets”.
- Se conserva únicamente “Administración → Soporte”.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

Abre:

`http://127.0.0.1:3000/dashboard/background-processes`

## Git

```powershell
git add .
git commit -m "Background jobs - Dashboard foundation"
git push
```
