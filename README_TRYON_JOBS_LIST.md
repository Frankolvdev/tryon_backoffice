# 02A — Try-On Jobs List

Segundo paquete acumulativo del módulo Try-On.

## Endpoints utilizados

- `GET /api/v1/admin/tryon-jobs`
  - `skip`
  - `limit`

El backend devuelve directamente una lista de `TryOnJobResponse`.

## Incluye

- Tipos TypeScript exactos de `TryOnJobResponse`.
- Listado real y paginado.
- Tabla completa para escritorio.
- Tarjetas responsive para móvil y tablet.
- Búsqueda local sobre la página cargada.
- Filtros locales por estado, tipo de artículo y calidad.
- Estados de carga, error y vacío.
- Costos y duración GPU.
- Archivos relacionados por ID.
- Workflow y RunPod job ID.
- Ruta preparada para el detalle del job.

## Nota sobre filtros

El endpoint actual solo admite `skip` y `limit`. Por eso búsqueda y filtros se aplican exclusivamente a la página cargada; no se inventaron parámetros de backend.

## Instalación

Extrae el ZIP sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

No hay dependencias nuevas.

## Pruebas

1. Abre `/dashboard/tryon/jobs`.
2. Cambia de página.
3. Prueba búsqueda y filtros.
4. Prueba diseño móvil.
5. Pulsa `Ver` para confirmar que abre `/dashboard/tryon/jobs/{id}`.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 02A Jobs List"
git push
```
