# 04C — Try-On Storage

## Endpoints reales utilizados

- `GET /api/v1/admin/storage/files`
- `GET /api/v1/admin/storage/files/{storage_file_id}/signed-url`

## Incluye

- Listado paginado de archivos.
- Metadatos completos disponibles.
- Proveedor.
- Bucket.
- Object key.
- Nombre original.
- Tipo MIME.
- Tamaño.
- Usuario propietario.
- Fecha de creación.
- Indicador de URL pública.
- Generación de URL firmada temporal.
- Apertura del archivo.
- Búsqueda y filtros locales sobre la página cargada.
- Métricas de la página.
- Navegación desde las integraciones y el sidebar.
- Responsive.
- Sin dependencias nuevas.

## Limitaciones reales del backend

No existen endpoints administrativos para:

- eliminar archivos;
- limpiar temporales;
- mover archivos;
- obtener estadísticas globales de almacenamiento.

No se inventaron esas funciones. Las métricas mostradas corresponden a la página cargada.

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
git commit -m "Try-On - ZIP 04C Storage"
git push
```
