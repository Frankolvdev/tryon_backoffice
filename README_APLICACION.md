# FIX BackOffice — Módulos + visor y previews de almacenamiento

BASE
tryon_backoffice-main - 2026-08-07T195859.600.zip

MÓDULOS DE GENERACIÓN

Nuevo módulo:
- Ya NO pide Motor.
- Ya NO pide Endpoint.
- Crea un borrador INACTIVO.
- Solo pide Clave, Nombre, Categoría y Descripción.
- Motor, endpoint, pricing, entradas, salidas y nodos se completan después.

Editar:
- Motor incluye "Sin motor todavía".
- Endpoint se marca explícitamente como opcional.
- Sin motor no permite activar ni ejecutar pruebas.

Eliminar módulo:
- Nuevo botón "Eliminar módulo".
- Pide confirmación.
- Backend solo permite hard-delete si nunca tuvo ejecuciones.
- Si existe historial, muestra el error y el administrador debe dejarlo inactivo.

ALMACENAMIENTO GLOBAL

- Reconoce imágenes por MIME O extensión.
- Corrige resultados con MIME genérico que antes aparecían como icono File.
- Miniaturas usan object-contain en lugar de object-cover:
  la imagen completa se ve sin recortes.
- Conserva el visor existente.

VISOR

- Bloquea scroll de BODY y HTML mientras está abierto.
- z-index 9999.
- overscroll/touch bloqueados en la capa.
- Zoom/pan ya no desplazan la página que queda detrás.
- Restaura el scroll original al cerrar.

ALMACENAMIENTO POR USUARIO

- Usa el MISMO StorageImageViewer del almacenamiento global.
- Click/tap en una miniatura abre zoom/pan/fullscreen/download.
- Usa /content por StorageFile, por lo que Backend resuelve el proveedor
  histórico correcto (Local/S3/R2).
- Miniaturas usan object-contain y ya no recortan imágenes.
- No cambia eliminación de generaciones ni trazabilidad financiera.

VALIDACIÓN
6 archivos TS/TSX: TypeScript 5.8.3 transpileModule, 0 errores.

npm run build no puede ejecutarse en este entorno porque el ZIP no incluye el
binario local de Next.js ("next: not found"). Ejecutarlo localmente.

COMANDOS
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev

GIT
git add .
git commit -m "ux: improve generation modules and storage previews"
git push
