MEGAZIP 4Q3 - MODAL EN EXPORTACIÓN REPRODUCIBLE DE MODELOS

Corrige que Modal no aparecía en el selector Destino.

Cambios:
- Agrega la opción "Volumen Modal".
- Al seleccionar Modal, muestra la subcarpeta opcional.
- El nombre del volumen se toma automáticamente de Proveedores de infraestructura.
- No solicita el ID/hash interno del volumen.
- Mantiene intactas las opciones Carpeta local y Volumen Docker.

Aplicación:
Descomprimir encima del BackOffice.

Validación:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
