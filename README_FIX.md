HOTFIX BackOffice — Ancestry poster frames

BASE: tryon_backoffice-main - 2026-08-16T172831.722.zip

BLINDAJE:
- Solo modifica la vista nueva Tools Generation > Ascendencias.
- NO modifica Backend.
- NO modifica Body Proportions.
- NO modifica Generation Modules.
- NO modifica AppWeb.

CAMBIOS:
- El poster automático de un video nuevo sale del PRIMER FRAME real (t≈0.001 s).
- Ya no usa 15% del video.
- Cada registro con video tiene botón "1er frame" para rehacer el cover desde el inicio.
- Tiene botón alternativo "Frame 20%".
- El frame alternativo sale EXACTAMENTE del 20% de la duración del video.
  Ejemplo: video de 5 s -> frame alternativo en 1.0 s.
- Ambos botones muestran/bloquean loading mediante el busy existente.
- Reutiliza el video ya guardado; no obliga a volver a subirlo.

ARCHIVOS:
src/app/dashboard/tools-generation/ancestry-assets/page.tsx
src/app/dashboard/tools-generation/ancestry-assets/page.module.css
