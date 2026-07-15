# 04A — Try-On ComfyUI Dashboard

## Endpoints reales utilizados

- `GET /api/v1/admin/comfyui/workflows`
- `POST /api/v1/admin/comfyui/workflows/validate`
- `POST /api/v1/admin/comfyui/run-workflow`
- `POST /api/v1/admin/comfyui/test-tryon`
- `POST /api/v1/admin/comfyui/process-tryon/{tryon_job_id}`

## Incluye

- Listado real de workflows ComfyUI.
- Selección de workflow.
- Validación por nodos requeridos.
- Conteo de nodos disponibles.
- Ejecución directa con patches.
- Client ID opcional.
- Esperar o no resultado.
- Visualización de prompt ID, imágenes, queue response e history.
- Prueba de Try-On Job.
- Procesamiento real de Try-On Job.
- Confirmación antes de procesar.
- Resultados JSON copiables.
- Estados de carga, vacío y error.
- Responsive.
- Sin dependencias nuevas.

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
git commit -m "Try-On - ZIP 04A ComfyUI Dashboard"
git push
```
