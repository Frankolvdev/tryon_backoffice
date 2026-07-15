# 08H — Billing Operations Final

## Backend revisado

Este cierre usa exclusivamente los endpoints reales de:

- `app/api/v1/endpoints/admin/billing_operations.py`
- `app/api/v1/endpoints/admin/billing_events.py`
- `app/schemas/billing_operations.py`
- `app/schemas/billing_event.py`
- `app/services/billing_job_service.py`
- `app/services/billing_validation_service.py`

## Endpoints utilizados

### Validación

- `GET /api/v1/admin/billing/validation`

Comprueba realmente:

- Stripe habilitado;
- API key;
- webhook secret;
- planes activos;
- sincronización de planes con Stripe;
- paquetes de tokens activos;
- eventos fallidos pendientes.

### Jobs

- `GET /api/v1/admin/billing/jobs`
- `POST /api/v1/admin/billing/jobs/{job_name}/run`

Jobs reales:

- `billing.hourly_maintenance`
- `billing.daily_maintenance`
- `billing.synchronize_subscriptions`
- `billing.reconcile_token_purchases`
- `billing.retry_failed_events`
- `billing.expire_stale_checkouts`

`max_items` admite de 1 a 1000.

### Eventos

- `GET /api/v1/admin/billing-events`
- `POST /api/v1/admin/billing-events/{event_id}/retry`

Filtros reales:

- `event_type`
- `status`
- `skip`
- `limit` entre 1 y 200

## Incluye

- Ruta `/dashboard/billing/operations`.
- Acceso Comercial → Operaciones billing.
- Estado de preparación comercial.
- Detalle de cada validación.
- Catálogo de jobs.
- Cron recomendado.
- Ejecución manual con confirmación.
- Resumen y errores del job.
- Listado paginado de eventos Stripe.
- Filtros reales.
- Payload y resultado.
- Error e intentos.
- Reintento de eventos fallidos.
- Estados de carga, error y vacío.
- Responsive.
- Sin dependencias nuevas.
- Sin endpoints inventados.

## Cierre del módulo Comercial

Quedan cubiertos:

- 08A Dashboard comercial.
- 08B Planes.
- 08C Suscripciones.
- 08D Tokens y compras.
- 08E Pagos.
- 08F Facturas.
- 08G Pricing y cupones.
- 08H Validación, jobs y eventos.

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

1. Abre `/dashboard/billing/operations`.
2. Revisa las validaciones.
3. Confirma que Stripe, planes y webhook estén correctos.
4. Ejecuta primero un job con `max_items=1`.
5. Revisa el resultado y Auditoría.
6. Filtra eventos por `failed`.
7. Abre un evento.
8. Reintenta únicamente eventos de prueba fallidos.
9. Comprueba que los procesados no permitan reintento.
10. Prueba escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Billing - ZIP 08H Operations Final"
git push
```
