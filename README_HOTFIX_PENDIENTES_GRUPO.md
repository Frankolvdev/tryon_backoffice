# Hotfix — Continuar pendientes del grupo

Este hotfix es intencionalmente un parche quirúrgico y NO reemplaza `page.tsx`.

Problema:
`Generar pendientes del grupo` usaba:

`status !== "ready"`

Eso incluía también presets `error` y `generating`, por lo que al reintentar un lote podía volver a comenzar desde una tarjeta fallida anterior.

Corrección:
El lote automático procesa únicamente:

`status === "draft"`

Por tanto:
- `ready` → se salta.
- `generating` → se salta.
- `error` → se salta; puede regenerarse manualmente.
- `draft` → se genera.

El script modifica una sola expresión y aborta sin escribir nada si no encuentra exactamente el código esperado.

## Aplicación

Descomprime este ZIP en cualquier carpeta y, desde la raíz del BackOffice, ejecuta:

```powershell
& "RUTA\APLICAR_HOTFIX_PENDIENTES_GRUPO.ps1"
```

Luego:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

Git:

```powershell
git add .
git commit -m "fix: resume body proportion group generation from draft presets"
git push
```
