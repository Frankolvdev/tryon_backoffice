# 04D — Try-On Monitoring & Metrics

## Endpoints reales utilizados

- `GET /api/v1/admin/tryon-jobs?skip=0&limit=200`
- `GET /api/v1/admin/external-ai-jobs?skip=0&limit=200`
- `GET /api/v1/admin/storage/files?skip=0&limit=200`
- `GET /api/v1/admin/workflow-definitions?skip=0&limit=200`

## Incluye

- Resumen de Try-On Jobs.
- Tasa de éxito.
- Estados en cola, procesamiento, completados, fallidos y cancelados.
- Tokens consumidos.
- Tiempo GPU estimado y real.
- Costo GPU estimado y real.
- Promedio de GPU por job.
- External AI Jobs activos y fallidos.
- Archivos y tamaño de almacenamiento cargado.
- Workflows activos y predeterminados.
- Actualización manual.
- Navegación desde las pestañas de integraciones.
- Responsive.
- Sin dependencias nuevas.

## Limitación real

El backend no expone un endpoint JSON dedicado de monitoreo global. El panel agrega datos reales de los endpoints administrativos y utiliza hasta 200 registros por recurso.

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
git commit -m "Try-On - ZIP 04D Monitoring Metrics"
git push
```
