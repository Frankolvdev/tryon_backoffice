# 02C1 — Try-On Job Actions

Paquete acumulativo del módulo Try-On.

## Endpoint utilizado

- `PATCH /api/v1/admin/tryon-jobs/{job_id}`

## Campos reales integrados

El formulario corresponde exactamente a `TryOnJobAdminUpdate`:

- `status`
- `error_message`
- `runpod_job_id`
- `comfy_workflow_name`
- `actual_gpu_seconds`
- `actual_gpu_cost_cents`

## Incluye

- Formulario administrativo completo.
- Actualización real mediante PATCH.
- Estado.
- Error.
- RunPod Job ID.
- Workflow ComfyUI.
- Tiempo GPU real.
- Costo GPU real.
- Validaciones.
- Estados de carga y error.
- Actualización inmediata del resto del detalle.
- Responsive.
- Sin dependencias nuevas.

## Importante

Este paquete no agrega botones falsos de reintentar o cancelar. El backend actual solo expone actualización administrativa mediante PATCH. Las acciones adicionales se evaluarán en el paquete 02C2 únicamente si existe soporte real.

## Instalación

Extrae el ZIP sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre un job real.
2. Cambia el estado.
3. Cambia workflow o RunPod ID.
4. Registra segundos y costo GPU.
5. Guarda.
6. Actualiza la página y confirma persistencia.
7. Prueba valores negativos para confirmar validación.
8. Revisa móvil.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 02C1 Job Actions"
git push
```
