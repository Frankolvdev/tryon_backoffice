# MegaZIP 4F — BackOffice — Finanzas por generación + bolsas promocionales

BASE EXACTA
tryon_backoffice-main - 2026-08-07T155806.901.zip

ALCANCE
Cambio exclusivamente visual/explicativo en:
src/app/dashboard/finances/generations/page.tsx

NO modifica:
- Backend
- AppWeb
- endpoints
- fórmulas
- FIFO
- snapshots
- descuentos
- cupones
- planes
- conciliaciones
- Caja
- vencimientos
- movimientos
- Stripe
- Modal / RunPod / Beam

QUÉ SE AGREGA
1. La vista reconoce visualmente bolsas:
   - Compra
   - Plan
   - Con cupón
   - Gratis / promotional_credit

2. Se conserva la tabla existente de "¿De dónde salieron los tokens?".
   Solo se añade una insignia de tipo de bolsa.

3. Nueva sección explicativa:
   "¿Qué tipo de dinero aportó cada bolsa?"

   Para cada bolsa muestra, usando exclusivamente valores que YA entrega
   token_bags_used:
   - Tokens usados
   - Pagó el cliente
   - Parte para IA
   - Gastos del negocio
   - Ganancia

4. Para promotional_credit explica explícitamente:
   - Cliente pagó = USD 0
   - Ganancia = USD 0
   - Gastos del negocio = USD 0
   - La infraestructura está respaldada por el fondo promocional

5. Las bolsas con cupón conservan y explican que el descuento sale de la
   ganancia; no se recalcula absolutamente nada en el frontend.

IMPORTANTE
La vista NO infiere ni reconstruye fórmulas. Lee los campos ya calculados por
el backend:
- cash_value_at_purchase_usd
- infrastructure_capacity_from_tokens_usd
- operational_reserve_from_tokens_usd
- company_profit_usd
- source / source_label

VALIDACIÓN
El TSX pasó TypeScript 5.8.3 transpileModule:
0 diagnostics.

APLICACIÓN
Extraer directamente sobre:
F:\PROYECTOS PERSONALES\TRYON\backoffice

PRUEBA LOCAL
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev

GIT
git add .
git commit -m "ux: explain promotional and mixed token bags in generation finances"
git push
