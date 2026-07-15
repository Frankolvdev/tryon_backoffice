# 03A — Try-On Workflows List

Paquete acumulativo del módulo Try-On.

## Endpoint utilizado

- `GET /api/v1/admin/workflow-definitions`

## Filtros reales integrados

- `key`
- `category`
- `is_active`
- `is_default`
- `search`
- `skip`
- `limit`

La interfaz utiliza búsqueda, categoría, activo, predeterminado y paginación.

## Incluye

- Listado real de workflows.
- Tabla para escritorio.
- Tarjetas responsive para móvil y tablet.
- Búsqueda real del backend.
- Filtros reales del backend.
- Paginación real.
- Versión, categoría, modos de ejecución y número de nodos.
- Estado activo/inactivo.
- Indicador de workflow predeterminado.
- Fechas y creador.
- Ruta preparada para detalle.
- Sin dependencias nuevas.

## Instalación

Extrae el ZIP directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre `/dashboard/tryon/workflows`.
2. Prueba búsqueda.
3. Prueba filtros de activo y predeterminado.
4. Cambia de página.
5. Abre un workflow.
6. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 03A Workflows List"
git push
```
