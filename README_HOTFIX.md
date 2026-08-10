# HOTFIX — Body Proportions workflow upload

Corrige el error de Turbopack `await isn't allowed in non-async function` en `uploadWorkflow`.

Copiar el contenido de este ZIP sobre la raíz del BackOffice, conservando rutas.

Después ejecutar:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

Git:

```powershell
git add .
git commit -m "fix: correct async workflow upload in body proportions generator"
git push
```
