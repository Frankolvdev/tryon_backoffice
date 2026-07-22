# Hotfix 35 — Puertos alineados y eliminación de nodos

## Correcciones

- Los handles de entrada y salida ahora se posicionan dentro de la fila real de cada puerto.
- Se usa `useUpdateNodeInternals()` para recalcular las coordenadas cuando cambian inputs, outputs o el tamaño del nodo.
- Se eliminó el cálculo fijo `top: 96 + index * 28` que provocaba cables desplazados.
- Cada nodo Workflow o Python incluye el botón **Eliminar**.
- La eliminación pide confirmación y usa el endpoint real:
  `DELETE /api/admin/generation-modules/{module_id}/steps/{step_id}`.
- Los nodos estructurales Entradas y Salidas no se pueden eliminar.
