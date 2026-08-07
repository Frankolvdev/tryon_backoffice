# MegaZIP 4B — BackOffice — Caja de Gastos Operativos FINAL

BASE EXACTA
tryon_backoffice-main - 2026-08-07T134137.486.zip
(MegaZIP 1, 2 y 3 ya aplicados)

ECONOMÍA GLOBAL
Ahora separa claramente:
- Base económica de 1 token (IA + ganancia).
- Fondo operativo por token.
- Precio comercial nominal resultante.

Ejemplo:
  Base:      USD 0.110
  Operación: USD 0.002
  Venta:     USD 0.112 antes de descuentos.

La UI advierte que el fondo operativo NO participa en el cálculo de tokens de
una generación.

CAJA OPERATIVA
Nueva sección dentro de Caja:
- disponible para gastar;
- fondo operativo/token vigente;
- fondos liberados;
- fondos todavía bloqueados por política de reembolso;
- gastos registrados;
- formulario para registrar gastos/retiros operativos;
- historial de movimientos.

DETALLE DE BOLSA
Muestra:
- fondo operativo congelado por token;
- fondo operativo total original;
- fondo operativo ya liberado.

Esto permite verificar que una bolsa antigua mantiene su snapshot aunque la
configuración actual cambie.

NO MODIFICA
- Caja verde;
- Caja IA;
- fondeos a proveedores;
- créditos promocionales;
- pérdidas pendientes;
- vencimientos;
- fórmulas de tokens;
- AppWeb.

VALIDACIÓN
Los 3 archivos modificados pasaron parser sintáctico TypeScript 5.8.3.
El build completo debe ejecutarse localmente con node_modules.

FLUJO DE CONFIGURACIÓN
1. Configurar Fondo operativo por token.
2. Guardar.
3. Pulsar "Recalcular catálogo".
4. Para planes recurrentes ya vinculados a Stripe, usar el flujo existente
   "Sincronizar con Stripe" para aplicar el nuevo precio al siguiente periodo.
