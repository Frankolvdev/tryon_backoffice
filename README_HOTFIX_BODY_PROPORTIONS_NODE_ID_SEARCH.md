# Hotfix — búsqueda por Node ID

Cambio aislado de BackOffice.

- Agrega un campo `Buscar ID de nodo...` a cada selector de Node ID.
- La búsqueda acepta únicamente números.
- Filtra únicamente por el ID del nodo.
- No modifica backend, mappings existentes ni otras áreas del BackOffice.
- El nodo actualmente seleccionado permanece disponible aunque el filtro no coincida.

Aplicación:
1. Copiar el contenido del ZIP sobre la raíz del BackOffice.
2. Ejecutar:
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   npm run build
   npm run dev

Git:
   git add .
   git commit -m "fix: add node id search to body proportion mappings"
   git push
