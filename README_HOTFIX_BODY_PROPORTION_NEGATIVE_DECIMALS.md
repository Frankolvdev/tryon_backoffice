# Hotfix — negativos y decimales en Body Proportions

BackOffice only.

Corrige el editor numérico de la herramienta para permitir:
- -0.5
- -1.25
- 0.35
- -0,5 (se normaliza a -0.5 al confirmar)

El valor ya no se convierte a 0 mientras el usuario está escribiendo el signo negativo.

Blindaje:
- No cambia backend.
- No cambia fórmulas.
- No cambia límites.
- No cambia storage, workflows, mappings ni generación.
- Solo modifica el componente Field de esta vista.

Aplicar:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev

Git:
git add .
git commit -m "fix: preserve negative decimal values in body proportion editor"
git push
