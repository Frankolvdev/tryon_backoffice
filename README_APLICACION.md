# MegaZIP BackOffice — Crédito recurrente + dinero propio para tokens gratis

BASE EXACTA
tryon_backoffice-main - 2026-08-07T173758.826(1).zip

ALCANCE
Solo amplía la sección existente:
Caja -> Promociones y tokens gratis

NO cambia diseño general de Caja ni otras vistas.

NUEVO DESGLOSE
La Caja Promocional muestra:
- Total disponible
- Crédito recurrente de proveedores
- Dinero propio

Por proveedor también muestra:
- saldo recurrente;
- saldo propio;
- total;
- tokens aproximados que puede respaldar.

CRÉDITO RECURRENTE
Formulario:
- Nombre
- Proveedor
- Saldo real de ESTE ciclo
- Inicio del ciclo actual
- Fin del ciclo actual
- Monto completo de CADA ciclo siguiente

Ejemplo Modal:
- Saldo actual: 19.76
- Inicio: 2026-08-01
- Fin: 2026-09-01
- Próximos ciclos: 30

La UI NO asume USD 30.

Cada fuente muestra:
- disponible ahora;
- ciclo actual;
- saldo con el que empezó a registrarse;
- cuánto ya se había utilizado antes de registrarlo;
- cuánto se asignó desde que se registró;
- monto de próximos ciclos;
- activar/pausar.

DINERO PROPIO
El formulario anterior de "Agregar dinero para tokens gratis" se conserva,
pero ahora queda explicado como:
"Agregar tu propio dinero para tokens gratis".

Ese saldo:
- no se reinicia;
- no vence por esta capa;
- funciona como respaldo cuando se acaba el crédito recurrente.

Los fondos promocionales históricos se conservan como dinero propio para no
reinterpretar datos anteriores.

PRIORIDAD
La UI explica que el sistema usa:
1. crédito recurrente que puede vencer;
2. dinero propio.

TOKENS / BOLSAS
No cambia:
- asignación a usuarios;
- tokens gratis de registro;
- switch para deudas anteriores;
- bolsas promocionales;
- retiro de tokens gratis;
- ganancia 0;
- gasto operativo 0.

VALIDACIÓN
Los 2 archivos TS/TSX modificados pasaron TypeScript 5.8.3 transpileModule:
0 diagnostics.

npm run build no pudo ejecutarse aquí porque el ZIP fuente no incluye el
binario Next.js en node_modules ("next: not found"). Ejecutarlo localmente.

APLICACIÓN
Extraer directamente sobre la raíz del BackOffice.

COMANDOS
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev

GIT
git add .
git commit -m "feat: separate recurring provider credits from own promotional funds"
git push
