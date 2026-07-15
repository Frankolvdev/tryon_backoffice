# 08G — Pricing & Coupons

## Backend revisado

Este paquete usa exclusivamente los endpoints reales:

### Pricing

- `GET /api/v1/admin/pricing-rules`
- `POST /api/v1/admin/pricing-rules`
- `PATCH /api/v1/admin/pricing-rules/{rule_id}`

### Cupones

- `GET /api/v1/admin/billing-coupons`
- `POST /api/v1/admin/billing-coupons`
- `PATCH /api/v1/admin/billing-coupons/{coupon_id}`
- `POST /api/v1/admin/billing-coupons/{coupon_id}/sync-stripe`
- `POST /api/v1/admin/billing-coupons/{coupon_id}/activate`
- `POST /api/v1/admin/billing-coupons/{coupon_id}/deactivate`

## Pricing real

Cada regla define:

- operación;
- tipo de artículo;
- calidad;
- costo en tokens;
- segundos GPU estimados;
- costo GPU estimado en centavos;
- margen porcentual;
- estado activo.

El backend no expone eliminación de reglas ni un simulador administrativo. Este ZIP no inventa esas funciones.

## Cupones reales

Soporta:

- descuento porcentual;
- descuento fijo;
- duración una vez, para siempre o repetitiva;
- límite de canjes;
- solo primera transacción;
- compra mínima;
- vigencia;
- metadata;
- activación;
- sincronización con Stripe.

Al editar, el backend solo permite cambiar los campos admitidos por `BillingCouponUpdate`. Código, tipo de descuento, duración e importe no son editables después de crear el cupón.

## Incluye

- Ruta `/dashboard/billing/pricing-coupons`.
- Acceso Comercial → Pricing y cupones.
- Crear y editar reglas.
- Activar/desactivar reglas desde el editor.
- Crear y editar cupones.
- Porcentaje o importe fijo.
- Duración repetitiva.
- Vigencia y límites.
- Primera compra y compra mínima.
- Metadata.
- Activar/desactivar cupones.
- Sincronizar con Stripe.
- Filtros reales de cupones.
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

## Git

```powershell
git add .
git commit -m "Billing - ZIP 08G Pricing Coupons"
git push
```
