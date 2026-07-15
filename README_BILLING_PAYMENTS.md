# 08E — Billing Payments

## Backend revisado

Este paquete utiliza exclusivamente los endpoints reales de:

- `app/api/v1/endpoints/admin/billing_payments.py`
- `app/schemas/billing_history.py`
- `app/services/billing_history_service.py`

## Endpoints utilizados

- `GET /api/v1/admin/billing-payments`
- `GET /api/v1/admin/billing-payments/{payment_id}`
- `POST /api/v1/admin/billing-payments/{payment_id}/reconcile`
- `POST /api/v1/admin/billing-payments/{payment_id}/refund`

## Filtros reales

- `user_id`
- `status`
- `payment_type`
- `skip`
- `limit` entre 1 y 200

## Datos reales mostrados

- usuario;
- billing customer;
- suscripción;
- proveedor;
- tipo y estado;
- moneda;
- importe;
- importe reembolsado;
- importe todavía reembolsable;
- PaymentIntent;
- Charge;
- Checkout Session;
- código y mensaje de fallo;
- descripción;
- metadata;
- fechas de pago, fallo y reembolso.

## Conciliación

El backend recupera el PaymentIntent de Stripe y puede actualizar:

- estado interno;
- fecha de pago o fallo;
- Charge ID;
- importe recibido;
- código y mensaje de error;
- metadata de última conciliación.

## Reembolsos

El backend admite:

- reembolso total dejando `amount` vacío;
- reembolso parcial con `amount` mayor que cero;
- razones `duplicate`, `fraudulent` y `requested_by_customer`;
- cálculo del saldo reembolsable;
- estado `refunded` o `partially_refunded`.

Las compras de tokens no se reembolsan desde este endpoint. Deben gestionarse en `Comercial → Tokens`, tal como exige el backend.

## Incluye

- Ruta `/dashboard/billing/payments`.
- Acceso Comercial → Pagos.
- Listado paginado con total real.
- Filtros de backend.
- Búsqueda local en la página.
- Métricas por estado.
- Detalle completo.
- Identificadores Stripe.
- Error de pago.
- Metadata.
- Conciliación.
- Reembolso total o parcial.
- Confirmación antes de reembolsar.
- Estados de carga, error y vacío.
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

1. Abre `/dashboard/billing/payments`.
2. Filtra por usuario, estado y tipo.
3. Abre un pago.
4. Verifica PaymentIntent, Charge y Checkout Session.
5. Ejecuta conciliación en modo test.
6. Prueba un reembolso parcial en un pago que no sea de tokens.
7. Prueba el reembolso restante.
8. Confirma que una compra de tokens indique usar el módulo Tokens.
9. Revisa Auditoría.
10. Prueba escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Billing - ZIP 08E Payments"
git push
```
