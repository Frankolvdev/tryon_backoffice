# Fix 40 — Registro estable de Handles y edges

- Los Handle IDs ahora son locales al nodo y no incluyen el nodeId codificado.
- Se elimina la doble codificación `step%3A3` / `step%253A3`.
- Los edges se cargan un frame después de los nodos para permitir que React Flow registre los Handles.
- Solo se renderizan edges cuyo sourceHandle y targetHandle existen realmente.
- El ID del edge se basa en el input destino, garantizando una sola key por input.
- Se mantiene la validación de tipos, persistencia, desconexión y nodos obligatorios Assets/Output.
