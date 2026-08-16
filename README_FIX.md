MEGAZIP BackOffice — Catálogo de ascendencias / países

Base exacta:
tryon_backoffice-main - 2026-08-16T164830.256.zip

Cambios ÚNICOS:
- Reemplaza la vista nueva de Ascendencias de rostro.
- Agrega catálogo local de 251 opciones (14 destacadas + catálogo ISO mundial).
- Destacadas aparecen primero.
- Buscador por nombre, país, alias o código ISO.
- Bandera, código, latitud/longitud y orden vienen precargados.
- Ya NO hay que escribir ISO, bandera, latitud ni longitud.
- Ya NO hay botón "Crear ancestry".
- Al subir el primer video, crea automáticamente el registro y genera poster WebP.
- Conserva storage Automatic / Local / Amazon S3 / Cloudflare R2.
- Conserva Import/Export ZIP.
- Conserva reemplazo de video/poster, Visible y Eliminar.

BLINDAJE:
- NO modifica Backend.
- NO modifica Body Proportions.
- NO modifica Generation Modules.
- NO modifica AppWeb.
- NO modifica navegación ni otros módulos.

Archivos:
src/lib/ancestry-country-catalog.ts
src/app/dashboard/tools-generation/ancestry-assets/page.tsx
src/app/dashboard/tools-generation/ancestry-assets/page.module.css
