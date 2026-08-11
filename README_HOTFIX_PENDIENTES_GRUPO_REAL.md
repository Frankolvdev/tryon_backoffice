# Hotfix BackOffice — continuar pendientes del grupo

Contiene el archivo real ya corregido:
`src/app/dashboard/tools-generation/body-proportions/page.tsx`

Cambio único:
- `Generar pendientes del grupo` procesa solo `status === "draft"`.
- `ready`, `generating` y `error` se saltan.

Aplicar directamente sobre la raíz del BackOffice.

Luego:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev

Git:
git add .
git commit -m "fix: resume body proportion group generation from draft presets"
git push
