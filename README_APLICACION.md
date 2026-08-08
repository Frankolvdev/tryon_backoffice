# FIX BackOffice — Card informativo de gastos disponibles

BASE
tryon_backoffice-main - 2026-08-07T194141.199.zip

ÚNICO ALCANCE
- Agrega arriba de Caja el séptimo card: "Gastos disponibles".
- Muestra operational.available_operational_funds_usd.
- Es únicamente informativo: no mueve dinero ni modifica fórmulas.
- Usa un color fucsia diferenciado de los demás cards.
- En escritorio XL los 7 cards se muestran en una sola fila con 7 columnas iguales.
- En pantallas menores conserva comportamiento responsive.
- No modifica backend, endpoints, motor financiero, FIFO, bolsas, tokens ni gastos.

ARCHIVO MODIFICADO
src/app/dashboard/finances/cashbox/page.tsx

SIN MIGRACIÓN
SIN CAMBIOS .env

VALIDACIÓN
El ZIP fuente no incluye node_modules con tsc ejecutable, por lo que la compilación final debe hacerse localmente.

COMANDOS
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev

GIT
git add .
git commit -m "ux: add available business expenses cashbox card"
git push
