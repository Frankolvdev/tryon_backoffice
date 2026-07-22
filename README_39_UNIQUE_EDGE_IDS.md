# Fix 39 — IDs únicos y deduplicación de wires

Corrige el warning de React/React Flow:

`Encountered two children with the same key, assets-3-image`

Cambios:
- IDs deterministas y únicos para cada edge usando nodo/handle origen y nodo/handle destino.
- Deduplicación de bindings históricos por input destino.
- Un input solo conserva un wire visible y persistente.
- Eliminación preventiva de puertos duplicados por ID antes de renderizar Handles.
- Las conexiones nuevas reemplazan el wire anterior del mismo input sin producir keys repetidas.

Instalación: descomprimir directamente sobre la raíz del BackOffice.
