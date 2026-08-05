# MegaZIP 2B — BackOffice de almacenamiento multi-proveedor

## Incluye
- Configuración de Local, Amazon S3 y Cloudflare R2 dentro de Almacenamiento.
- Guardar, probar conexión y seleccionar proveedor activo.
- Aviso de que el cambio solo afecta archivos nuevos.
- Galería unificada con proveedor, bucket, ID y object key.
- Filtros actualizados para Local, Amazon S3, Cloudflare R2 y S3 legado.
- Oculta `storage_provider` y `local_storage_dir` de Configuración general para evitar duplicidad.

## Aplicación
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```
