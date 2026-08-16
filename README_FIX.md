HOTFIX BackOffice — Ancestry Media UX

Base:
tryon_backoffice-main - 2026-08-16T165654.226.zip

ÚNICAMENTE modifica la nueva vista de Ascendencias.

Cambios:
- Arab/African muestran ARAB/AFR en vez de un globo que parece bandera faltante.
- Países ISO reales conservan su bandera.
- Subir video muestra etapas reales:
  Preparando poster -> Subiendo video -> Subiendo poster -> Finalizando.
- Spinner visible y controles de upload deshabilitados mientras trabaja.
- Poster/video usan object-fit: contain; ya no recortan la imagen vertical.
- Si existe video, la propia preview sirve como Play/Pause.
- Sin controles nativos/barra de reproductor.
- Al reproducir otro, se pausa el anterior.
- muted + playsInline + loop.

NO modifica:
- Backend
- Body Proportions
- Generation Modules
- AppWeb
- catálogo de países
- almacenamiento/API existentes

Archivos:
src/app/dashboard/tools-generation/ancestry-assets/page.tsx
src/app/dashboard/tools-generation/ancestry-assets/page.module.css
