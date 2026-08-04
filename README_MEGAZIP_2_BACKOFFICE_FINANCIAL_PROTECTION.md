# MegaZIP 2 — BackOffice Financial Protection

Cambios incrementales:

- Nueva vista `/dashboard/billing/pricing`.
- Redirección de la ruta anterior `/dashboard/billing/pricing-coupons`.
- Nueva vista independiente `/dashboard/billing/coupons`.
- Tarjeta de protección global con máximo protegido, máximo seguro, holgura, estado y regla limitante.
- Planes con descuento solicitado y datos de descuento efectivo/protegido.
- Paquetes con descuento solicitado y datos de descuento efectivo/protegido.
- Cupones restringidos a paquetes de tokens o compra libre de tokens.
- Navegación comercial separada en Pricing y Cupones.

El backend continúa siendo la autoridad final: la UI solo presenta resultados y envía la configuración solicitada.
