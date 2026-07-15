# Fix 02B1 — Try-On types

Corrige la eliminación accidental de `TryOnJobListResponse`, que todavía utiliza:

`src/lib/tryon/normalize.ts`

## Instalación

Extrae este ZIP sobre la raíz de `backoffice` y acepta reemplazar el archivo.

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
```

Si compila:

```powershell
npm run dev
```

## Git

No hagas commit separado si todavía no habías confirmado el ZIP 02B1. Usa:

```powershell
git add .
git commit -m "Try-On - ZIP 02B1 Job Detail Core"
git push
```
