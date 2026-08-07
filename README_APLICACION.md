# MegaZIP 3B — BackOffice — Preparación financiera V3

BASE EXACTA
tryon_backoffice-main - 2026-08-07T130407.921.zip

OBJETIVO
Preparar el BackOffice para que el precio comercial y la base económica de
generación sean conceptos distintos antes del MegaZIP 4.

CAMBIOS
- CommercialSettingsResponse conoce:
  * token_value_usd (base de generación)
  * operational_reserve_per_token_usd (0 por ahora)
  * commercial_sale_value_per_token_usd
- Editor de paquetes usa commercial_sale_value_per_token_usd para la vista
  del precio nominal.
- Editor de planes usa commercial_sale_value_per_token_usd para la vista
  del precio nominal.

Con el componente operativo actual en 0, los importes visibles no cambian.
Cuando MegaZIP 4 lo habilite, estos editores no confundirán el recargo
operativo con la capacidad de IA.

NO MODIFICA
- Caja;
- retiros;
- créditos promocionales;
- pérdidas pendientes;
- descuentos;
- Stripe;
- fórmulas del backend.

VALIDACIÓN
Los 3 archivos modificados pasaron parser sintáctico TypeScript 5.8.3.
El build completo debe ejecutarse localmente con node_modules del proyecto.

APPWEB
MegaZIP 3 no requiere cambios de AppWeb.
