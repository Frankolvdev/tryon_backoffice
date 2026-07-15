# 08B — Subscription Plans Catalog

## Backend revisado

Este ZIP utiliza únicamente los endpoints reales de:

`app/api/v1/endpoints/admin/subscription_plans.py`

y los contratos reales de:

`app/schemas/subscription_plan.py`

## Endpoints utilizados

- `GET /api/v1/admin/subscription-plans`
- `GET /api/v1/admin/subscription-plans/{plan_id}`
- `POST /api/v1/admin/subscription-plans`
- `PATCH /api/v1/admin/subscription-plans/{plan_id}`
- `POST /api/v1/admin/subscription-plans/{plan_id}/activate`
- `POST /api/v1/admin/subscription-plans/{plan_id}/deactivate`
- `POST /api/v1/admin/subscription-plans/{plan_id}/sync-stripe`
- `DELETE /api/v1/admin/subscription-plans/{plan_id}`
- `POST /api/v1/admin/subscription-plans/seed-defaults`

## Campos reales

- key
- name
- description
- billing_interval: month/year
- currency
- price_amount
- tokens_per_period
- max_generations_per_period
- priority
- features
- metadata
- is_public
- is_active
- sort_order
- stripe_product_id
- stripe_price_id
- stripe_configured

## Incluye

- Ruta `/dashboard/billing/plans`.
- Acceso Comercial → Planes.
- Filtros reales.
- Crear plan.
- Editar plan.
- Activar y desactivar.
- Eliminar.
- Seed de defaults.
- Sincronizar producto y precio con Stripe.
- Indicadores de visibilidad y Stripe.
- Validaciones alineadas con Pydantic.
- Responsive.
- Sin dependencias nuevas.
- Sin endpoints inventados.

## Importante sobre Stripe

Sincronizar un plan crea o actualiza su producto y precio de Stripe mediante el backend. Para que funcione, la integración Stripe debe estar habilitada y tener una Secret Key válida.

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

1. Abre `/dashboard/billing/plans`.
2. Ejecuta `Crear defaults`.
3. Crea un plan mensual.
4. Edita precio, tokens y características.
5. Desactiva y activa el plan.
6. Sincroniza con Stripe en modo test.
7. Verifica `stripe_product_id` y `stripe_price_id`.
8. Prueba filtros.
9. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Billing - ZIP 08B Subscription Plans Catalog"
git push
```
