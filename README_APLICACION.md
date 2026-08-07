# MegaZIP 1B — BackOffice — Pérdidas pendientes

BASE:
tryon_backoffice-main - 2026-08-07T114604.488.zip

CAMBIOS:
- Nueva tarjeta "Pérdidas pendientes" dentro de Caja.
- Muestra número de generaciones bloqueadas y tokens por recuperar.
- Separa infraestructura pendiente exacta de ganancia potencial estimada.
- Tabla de ejecuciones pendientes con usuario, proveedor, tokens y fecha.
- No modifica la caja verde, retiros, fondeos, expiraciones ni bolsas.

VALIDACIÓN:
Los dos archivos modificados pasaron el parser sintáctico TypeScript 5.8.3.
No se pudo ejecutar el typecheck/build completo en el entorno porque el ZIP no
incluye node_modules/dependencias instaladas.

No hay cambios de AppWeb en MegaZIP 1: el botón manual existente sigue siendo
el fallback y el auto-desbloqueo se ejecuta en Backend.
