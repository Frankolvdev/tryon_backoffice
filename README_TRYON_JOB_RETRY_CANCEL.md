# 02C2 — Try-On Job Retry / Cancel

Paquete acumulativo del módulo Try-On.

## Endpoints reales utilizados

- `GET /api/v1/admin/external-ai-jobs?skip=0&limit=200`
- `GET /api/v1/admin/runpod-configs`
- `POST /api/v1/admin/runpod/jobs/{external_ai_job_id}/status`
- `POST /api/v1/admin/runpod/jobs/{external_ai_job_id}/cancel`

## Relación utilizada

El backend vincula una ejecución RunPod con el job Try-On mediante:

- `internal_job_type = "tryon"`
- `internal_job_id = tryon_job.id`

## Incluye

- Localización del External AI Job asociado.
- Lectura de la configuración RunPod activa.
- Actualización manual del estado desde RunPod.
- Cancelación real de la ejecución RunPod.
- Actualización del Try-On Job realizada por el backend al cancelar.
- Estado, fechas, proveedor e ID externo.
- Estados de carga y error.
- Confirmación antes de cancelar.
- Responsive.
- Sin dependencias nuevas.

## Reintento

El backend actual no expone un endpoint de reintento para Try-On Jobs ni External AI Jobs. Por eso no se inventó esa acción. El panel lo informa claramente y solo conecta acciones reales.

## Instalación

Extrae el ZIP directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Acepta reemplazar archivos.

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre un job Try-On que tenga External AI Job vinculado.
2. Comprueba la información RunPod.
3. Ejecuta `Actualizar estado`.
4. Cancela una ejecución no finalizada.
5. Actualiza el detalle del job y confirma el nuevo estado.
6. Abre un job sin ejecución vinculada.
7. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 02C2 Job Retry Cancel"
git push
```
