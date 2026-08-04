# FIX BackOffice MegaZIP 2 — Tipos de pricing

Corrige el error de TypeScript `Duplicate identifier 'desired_profit_usd'` y alinea `PricingRuleCreate` con el contrato actual del backend.

## Cambios

- Elimina la segunda declaración duplicada de `desired_profit_usd` en `PricingRuleResponse`.
- Mantiene `average_execution_cost_usd` y `desired_profit_percent` únicamente como campos legacy de respuesta, porque el backend todavía los devuelve para compatibilidad.
- Actualiza `PricingRuleCreate` para que exija los campos del modelo nuevo:
  - `desired_profit_usd`
  - `initial_estimated_duration_seconds`
  - `technical_margin_seconds`
  - `is_active`
- Deja opcionales los clasificadores que el backend completa con valores predeterminados.

## Aplicación

Descomprimir sobre la raíz de `tryon_backoffice` y reemplazar el archivo existente.
