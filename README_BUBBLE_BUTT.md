# Bubble Butt — BackOffice

Base exacta:
- tryon_backoffice-main - 2026-08-11T222540.456.zip

Nueva Etapa 2:
- Estado de bloqueo/desbloqueo según Body Proportions.
- Workflow API Bubble Butt.
- 3 valores globales Bubble Butt.
- Mapeo de nodos/inputs independiente.
- Malla dinámica Fat -> Hips -> 3 variantes.
- Generación pendiente secuencial y detención ante error.
- Preview usa el mismo proveedor configurado para nuevas generaciones.

No se cambian los controles/formulas/cards existentes de Body Proportions.

Validación TypeScript:
- Se ejecutó `tsc` de sintaxis sobre los archivos modificados.
- No se detectaron errores de parseo.
- `npm run build` no pudo ejecutarse en el contenedor porque el ZIP no incluye
  node_modules (Next no estaba instalado en este entorno).
