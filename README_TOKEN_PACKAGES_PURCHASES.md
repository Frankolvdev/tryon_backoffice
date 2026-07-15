# 08D — Token Packages & Purchases

## Backend revisado

Este paquete usa únicamente los endpoints reales de:

- `app/api/v1/endpoints/admin/tokens.py`
- `app/api/v1/endpoints/admin/token_purchases.py`

y los esquemas reales de:

- `app/schemas/token.py`
- `app/schemas/token_purchase.py`

## Paquetes de tokens

Endpoints:

- `GET /api/v1/admin/token-packages`
- `POST /api/v1/admin/token-packages`
- `PATCH /api/v1/admin/token-packages/{package_id}`

Campos:

- name
- description
- tokens_amount
- price_cents
- currency
- stripe_price_id
- is_active

El backend actual no expone un endpoint para eliminar paquetes ni uno para sincronizarlos automáticamente con Stripe. El formulario permite capturar el `stripe_price_id` existente sin inventar operaciones adicionales.

## Compras de tokens

Endpoints:

- `GET /api/v1/admin/token-purchases`
- `GET /api/v1/admin/token-purchases/{purchase_id}`
- `POST /api/v1/admin/token-purchases/{purchase_id}/reconcile`
- `POST /api/v1/admin/token-purchases/{purchase_id}/refund`

Filtros:

- user_id
- status
- skip
- limit de 1 a 200

## Reembolsos

El backend admite:

- reembolso total dejando `amount` vacío;
- reembolso parcial con importe mayor que cero;
- razones `duplicate`, `fraudulent` o `requested_by_customer`;
- retirar o conservar tokens mediante `remove_tokens`.

## Incluye

- Ruta `/dashboard/billing/tokens`.
- Acceso Comercial → Tokens.
- Crear y editar paquetes.
- Estado activo/inactivo.
- Precio en centavos.
- Stripe Price ID.
- Listado de compras.
- Filtro por usuario y estado.
- Detalle de compra y pago.
- Conciliación con Stripe.
- Reembolso total o parcial.
- Retiro opcional de tokens.
- Confirmación antes de reembolsar.
- Responsive.
- Sin dependencias nuevas.
- Sin endpoints inventados.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre `/dashboard/billing/tokens`.
2. Crea un paquete.
3. Edita tokens, precio y Stripe Price ID.
4. Activa y desactiva el paquete desde el editor.
5. Filtra compras por usuario y estado.
6. Abre una compra.
7. Ejecuta conciliación.
8. Prueba un reembolso únicamente con una compra de Stripe en modo test.
9. Confirma el retiro de tokens y revisa Auditoría.
10. Prueba escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Billing - ZIP 08D Token Packages Purchases"
git push
```
