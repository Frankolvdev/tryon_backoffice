# Hotfix — botón Sincronizar por tarjeta

BackOffice aislado para Body Proportion Tool.

Cada tarjeta ahora tiene:
- Guardar
- Sincronizar
- Generar / Regenerar

Sincronizar:
- descarta los valores guardados individualmente de esa categoría;
- solicita al backend recalcularlos desde las reglas globales actuales;
- conserva la preview existente como referencia;
- deja la tarjeta pendiente de regeneración.

No modifica otras vistas.

Aplicación:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev

Git:
git add .
git commit -m "feat: add per-card rule synchronization to body proportions"
git push
