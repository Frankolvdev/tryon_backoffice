# 04B — Try-On RunPod Dashboard

## Endpoints reales utilizados

- `GET /api/v1/admin/runpod-configs`
- `POST /api/v1/admin/runpod-configs`
- `PATCH /api/v1/admin/runpod-configs/{config_id}`
- `GET /api/v1/admin/external-ai-jobs?skip=0&limit=200`
- `POST /api/v1/admin/runpod/jobs`
- `POST /api/v1/admin/runpod/jobs/{external_ai_job_id}/status`
- `POST /api/v1/admin/runpod/jobs/{external_ai_job_id}/cancel`

## Incluye

- Dashboard RunPod Serverless.
- Listado de configuraciones.
- Crear configuración.
- Editar configuración.
- Activar/desactivar mediante edición.
- Endpoint ID y URL.
- GPU, Docker image y workflow ComfyUI.
- Workers mínimos y máximos.
- Costo estimado por segundo.
- Envío manual de jobs.
- Input JSON.
- Relación opcional con job interno.
- Listado de External AI Jobs RunPod.
- Actualización de estado.
- Cancelación.
- Respuestas JSON.
- Navegación directa desde el sidebar.
- Pestañas ComfyUI/RunPod.
- Responsive.
- Sin dependencias nuevas.

## Limitaciones reales del backend

No existen endpoints para:

- eliminar configuraciones;
- métricas en vivo de workers activos;
- reiniciar o reintentar ejecuciones.

No se inventaron esas funciones.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 04B RunPod Dashboard"
git push
```
