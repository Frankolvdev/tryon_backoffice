# Bubble Butt — ajuste incremental BackOffice

Base exacta:
tryon_backoffice-main - 2026-08-11T231108.785.zip

Cambios ÚNICOS:
- 4 variantes Bubble Butt: 0 / 0.4 / 0.8 / 1.2.
- 4 cards por cada Fat x Hips.
- Mientras una imagen genera, todos los otros Generar/Regenerar quedan deshabilitados.
- El backend también tiene protección independiente contra doble ejecución.
- El bloque de mappings principal se movió arriba y ahora se llama:
  "Vincular nodos e inputs · Body Proportions".
- El otro queda identificado como:
  "Vincular nodos e inputs · Bubble Butt".
- Zona de reinicio aclara que el checkbox aplica a workflows/mappings de ambas etapas.
- Checkbox desmarcado conserva ambos workflows/mappings.

No se tocaron anchors, compensaciones, biblioteca multi-provider,
fuente AppWeb, almacenamiento, generación pendiente, estilos generales ni otros módulos.

Nota:
`npm run build` no pudo ejecutarse en el contenedor porque el ZIP no incluye node_modules.
