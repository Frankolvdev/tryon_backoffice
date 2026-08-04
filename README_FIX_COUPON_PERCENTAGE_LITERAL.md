# FIX BackOffice — Coupon percentage literal

Corrige el error TypeScript donde `discount_type: "percentage"` era inferido como `string` al construir el payload del cupón.

No cambia lógica, endpoints, validaciones ni diseño.
