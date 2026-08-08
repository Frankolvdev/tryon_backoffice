# FIX BackOffice — Webhook + Simular +1 ciclo + acordeón cerrado

BASE
tryon_backoffice-main - 2026-08-07T182326.800.zip

CORRECCIÓN DEL DESFASE
El backend ya tenía periodicidad/webhook, pero el page.tsx recibido todavía
mostraba el formulario antiguo con Inicio + Fin y no renderizaba los botones.

AHORA AL CREAR UNA FUENTE
- Nombre
- Proveedor
- Saldo real de ESTE ciclo
- Inicio del ciclo actual
- Periodicidad
- Monto completo de próximos ciclos
- Permitir simulaciones

NO se pide fecha final. Backend la calcula.

EJEMPLO MODAL
Saldo actual: USD 19.76
Inicio: 01/08/2026
Periodicidad: Mensual
Próximos ciclos: USD 30

Backend calcula:
01/08/2026 -> 01/09/2026

BOTONES POR FUENTE
- Revisar ciclo ahora (webhook)
- Simular +1 ciclo (solo si Permitir simulaciones está activo)
- Guardar próximo monto
- Pausar/Activar

SIMULAR +1 CICLO
No pide fecha.
Mensual:
ciclo actual 01/08 -> 01/09
simula 01/09 -> 01/10 con el monto configurado.
No cambia nada real.

ACORDEÓN
"Promociones y tokens gratis" queda CERRADO al entrar a Caja.
"Compras y bolsas de tokens" conserva su comportamiento abierto por defecto.

VALIDACIÓN
- page.tsx: TypeScript 5.8.3 transpileModule, 0 diagnostics
- finance-cashbox.ts: TypeScript 5.8.3 transpileModule, 0 diagnostics

GIT
git add .
git commit -m "fix: show promotional cycle webhook and one-cycle simulation"
git push
