FIX BackOffice - importación del cliente API de Políticas legales

Causa:
La página importaba @/lib/browser-api, pero el helper real del proyecto está en @/lib/api/browser-api.

Aplicación:
1. Descomprime este ZIP sobre la raíz del BackOffice.
2. Ejecuta:
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   npm run build
   npm run dev

No modifica endpoints, navegación, documentos legales ni lógica de publicación.
