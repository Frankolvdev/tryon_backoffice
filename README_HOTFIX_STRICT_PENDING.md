# Hotfix BackOffice — generación pendiente estrictamente secuencial

Base exacta:
tryon_backoffice-main - 2026-08-11T170109.971.zip

Cambio limitado a la cola de generación:
- orden explícito Hips -> Breasts -> ID;
- antes de cada item consulta el estado actual del backend;
- ready/generating se saltan;
- draft/error se consideran pendientes;
- si un item falla, el lote se detiene;
- al volver a pulsar, el error se reintenta antes de avanzar;
- recarga el estado al finalizar.

No modifica botones ajenos, anchors, compensaciones, restore, workflow, mappings, storage ni otras vistas.
