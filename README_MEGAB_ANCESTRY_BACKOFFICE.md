# MegaZIP B — Ancestry Media Library (BackOffice)

Nueva vista:
`/dashboard/tools-generation/ancestry-assets`

Incluye:
- select/buscador editable de ancestry;
- país/flag/coordenadas para el futuro globo;
- storage `Automatic / Local / Amazon S3 / Cloudflare R2`;
- upload MP4/WebM;
- poster WebP automático generado EN EL NAVEGADOR desde el video, sin exigir ffmpeg al backend;
- reemplazo manual de poster;
- visible/inactivo;
- import/export ZIP;
- navegación nueva en Tools Generation.

Blindaje:
- no toca la página ni lógica de `body-proportions`;
- no toca Generation Modules;
- solo añade 5 archivos y una entrada mínima en navegación.

Aplicar después de MegaZIP A backend:
```powershell
python .\APLICAR_MEGAB_ANCESTRY_BACKOFFICE.py
npm run build
```
