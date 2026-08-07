# MegaZIP 4D — BackOffice — Caja más clara y tabla de bolsas explicada

BASE
tryon_backoffice-main - 2026-08-07T144104.490.zip

ALCANCE
Solo UX del BackOffice. No modifica Backend, AppWeb, endpoints, fórmulas,
snapshots, FIFO, descuentos, movimientos ni base de datos.

MEJORAS
- "Compras y bolsas de tokens" queda ABIERTA por defecto.
- Cada encabezado de la tabla incluye tooltip en lenguaje simple.
- Se agregan 4 leyendas por color encima de la tabla:
  Verde: dinero de la empresa.
  Lima: dinero todavía reservado.
  Azul: dinero para IA que sigue en caja.
  Violeta: dinero ya transferido a un proveedor.
- Se simplifican columnas:
  "Reserva vigente IA" -> "Reservado para tokens"
  "Enviado a proveedor" -> "Ya enviado a proveedor"
  "Disponible para enviar" -> "Aún en caja para IA"
  "Crédito liberado" -> "Crédito libre en proveedor"
  "Expira" -> "Vencimiento"
- Cards superiores:
  "Dinero para IA disponible" -> "Para proveedores de IA"
  "Dinero que respalda tokens activos" -> "Reservado para tokens activos"
- Los cards superiores ahora tienen fondos/bordes visualmente distintos.
  En especial, "Reservado para tokens activos" usa una identidad lima,
  claramente diferente del azul de "Para proveedores de IA".
- No se elimina ningún widget, dato, botón, tabla o acción.

VALIDACIÓN
El TSX modificado pasó transpileModule con TypeScript 5.8.3 sin errores
sintácticos.

APLICACIÓN
Extraer directamente sobre:
F:\PROYECTOS PERSONALES\TRYON\backoffice

VALIDACIÓN LOCAL
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev

GIT
git add .
git commit -m "ux: clarify cashbox cards and token bag table"
git push
