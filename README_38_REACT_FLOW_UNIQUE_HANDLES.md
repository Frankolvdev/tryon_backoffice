# Fix 38 — React Flow unique handles

Corrige React Flow error #008 al conectar Assets con inputs de Workflow/Python.

## Cambio
- Cada Handle usa un ID determinista único compuesto por nodo, dirección y puerto.
- Los edges persistidos y reconstruidos usan exactamente el mismo generador.
- La búsqueda y desconexión de puertos ya no depende de cortar prefijos como `in:`/`out:`.
- Conserva validación de tipos, eliminación de cables y persistencia actual.

## Aplicación
Descomprimir directamente sobre la raíz del BackOffice.
