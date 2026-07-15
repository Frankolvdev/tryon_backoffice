# 08A — Billing Dashboard Foundation

## Backend revisado

Este paquete se basa en el repositorio público actual:

- `Frankolvdev/tryon_backend`
- `Frankolvdev/tryon_backoffice`

El backend incluye módulos administrativos reales para:

- analítica comercial;
- pagos;
- facturas;
- eventos de billing;
- operaciones de billing;
- cupones;
- compras de tokens;
- planes;
- suscripciones;
- pricing.

Este primer ZIP usa únicamente el dashboard agregado.

## Endpoint real utilizado

- `GET /api/v1/admin/billing-analytics/dashboard`

Parámetros reales:

- `start`: fecha y hora opcional;
- `end`: fecha y hora opcional;
- `currency`: código de tres letras, default `USD`.

## Respuesta real

### Revenue

- gross_revenue
- refunded_revenue
- net_revenue
- subscription_revenue
- token_purchase_revenue
- other_revenue
- successful_payments
- failed_payments
- refunded_payments
- partially_refunded_payments

### Subscriptions

- monthly_recurring_revenue
- annual_recurring_revenue
- active_subscriptions
- trialing_subscriptions
- past_due_subscriptions
- canceled_subscriptions
- unpaid_subscriptions
- new_subscriptions
- canceled_during_period
- subscriber_churn_rate

### Tokens

- completed_purchases
- pending_purchases
- failed_purchases
- refunded_purchases
- tokens_sold
- bonus_tokens_granted
- total_tokens_granted

## Incluye

- Ruta `/dashboard/billing`.
- Acceso `Comercial → Dashboard comercial`.
- Filtro de fecha inicial.
- Filtro de fecha final.
- Moneda ISO.
- Ingresos brutos y netos.
- MRR y ARR.
- Ingresos por suscripciones y tokens.
- Pagos exitosos, fallidos y reembolsados.
- Estado de suscripciones.
- Churn.
- Estado de compras de tokens.
- Tokens vendidos y bonificados.
- Fecha de generación.
- Estados de carga y error.
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

1. Abre `/dashboard/billing`.
2. Comprueba la carga sin fechas.
3. Selecciona un rango de fechas.
4. Cambia la moneda a USD.
5. Verifica métricas cuando no existan pagos.
6. Registra una compra de prueba y actualiza.
7. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Billing - ZIP 08A Dashboard Foundation"
git push
```
