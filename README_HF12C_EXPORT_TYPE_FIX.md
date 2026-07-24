# HF12C — Corrección TypeScript del exportador

Corrige:

```text
This comparison appears to be unintentional because the types 'true' and 'false' have no overlap.
```

La causa era este flujo:

```ts
await save();
const saved = true;
if (saved === false) ...
```

Como `saved` siempre era literalmente `true`, TypeScript rechazaba la comparación.

El parche deja simplemente:

```ts
await save();
```

## Aplicación

Descomprime directamente en la raíz de `tryon_backoffice`:

```powershell
python apply_hf12c_export_type_fix.py
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Git

Después de comprobar:

```powershell
Get-ChildItem -Recurse -Filter "*.hf12c.bak" | Remove-Item
git add .
git commit -m "fix: remove impossible export save comparison"
git push
```
