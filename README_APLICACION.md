# MegaZIP 4C — BackOffice — Claridad UX de Precios y Caja

BASE EXACTA
tryon_backoffice-main - 2026-08-07T142620.428.zip
(MegaZIP 1, 2, 3 y 4 ya aplicados por el usuario)

ALCANCE
Este ZIP es SOLO de interfaz y textos. No modifica Backend, AppWeb, base de
datos, fórmulas, endpoints, snapshots, FIFO, descuentos ni movimientos.

CAMBIOS EN CONFIGURACIÓN DE TOKENS
- "Economía global / Una sola fuente de verdad" pasa a lenguaje simple:
  "Configuración de tokens / Cómo se forma el precio de cada token".
- "Base económica de 1 token (USD)" pasa a "Valor base del token".
- "Fondo operativo por token (USD)" pasa a "Extra por gastos del negocio".
- Se elimina el campo editable "Moneda comercial". La UI sigue mostrando USD.
  El valor de moneda recibido por API se conserva internamente por
  compatibilidad con el contrato existente; no se altera el Backend.
- Se muestra claramente:
    Valor base del token
    + Extra por gastos del negocio
    = Precio por token antes de descuentos
- Tooltips explican qué participa en el cálculo de generaciones y qué no.
- Se conserva Recalcular catálogo y Guardar exactamente con los endpoints
  existentes.

CAMBIOS EN CAJA
- Las tarjetas resumen permanecen visibles.
- El resto se organiza en acordeones para reducir saturación visual:
  * Promociones y tokens gratis
  * Cobros pendientes
  * Dinero enviado y saldo por proveedor
  * Retiros y transferencias
  * Gastos del negocio
  * Vencimiento de tokens
  * Compras y bolsas de tokens
- No se eliminó ningún widget, formulario, tabla ni acción existente.
- "Fondeo" se sustituye visualmente por expresiones más claras:
  * Enviar dinero a proveedor de IA
  * Registrar transferencia
  * Dinero enviado
  * Disponible para enviar
- Se simplifican otros conceptos:
  * Pérdidas pendientes -> Cobros pendientes en resumen
  * Reserva de tokens vigentes -> Dinero que respalda tokens activos
  * Ganancia todavía bloqueada -> Ganancia aún no disponible
  * Fondo operativo -> Extra por gastos del negocio
- Se agregan tooltips a métricas financieras delicadas del detalle de bolsa.
- "Snapshot financiero" se presenta como "Registro financiero congelado", con
  explicación; el dato técnico y su valor NO cambian.

BLINDAJE
NO cambia:
- pricing_service;
- valor ni cálculo de tokens;
- reserva IA;
- ganancias;
- descuentos/cupones/planes;
- snapshots;
- FIFO;
- Caja verde;
- Caja IA;
- créditos promocionales;
- pérdidas/cobros pendientes;
- vencimientos;
- Stripe;
- Modal / RunPod / Beam;
- ninguna API.

VALIDACIÓN
Los dos TSX modificados fueron parseados con TypeScript 5.8.3 mediante
transpileModule y ambos resultaron OK.
No se ejecutó next build en este entorno porque el ZIP no incluye node_modules.

APLICACIÓN
Extraer directamente sobre la raíz del BackOffice:
F:\PROYECTOS PERSONALES\TRYON\backoffice

VALIDACIÓN LOCAL
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev

GIT
git add .
git commit -m "ux: simplify pricing and cashbox financial concepts"
git push
