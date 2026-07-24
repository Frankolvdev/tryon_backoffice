# HF12B — Corrección de compilación del BackOffice

Corrige este error:

```text
Cannot find name 'saveAllConfiguration'
```

La causa era que HF12 intentaba detectar una función TypeScript mediante
`typeof saveAllConfiguration`, pero TypeScript exige que el identificador exista
en tiempo de compilación.

El parche inspecciona el archivo al aplicarse y utiliza la función de guardado
que realmente exista:

- `saveAllConfiguration(false)`, o
- `save()`, o
- `saveExportConfiguration(false)` + `saveRuntimeConfiguration(false)`.

## Aplicación

Descomprime este ZIP directamente en la raíz de `tryon_backoffice`:

```powershell
python apply_hf12b_export_compile_fix.py
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Git

Después de comprobar el build:

```powershell
Get-ChildItem -Recurse -Filter "*.hf12b.bak" | Remove-Item
git add .
git commit -m "fix: resolve model export save function at patch time"
git push
```
