# 08F — Billing Invoices

## Backend revisado

Este paquete usa únicamente los endpoints reales de:

- `app/api/v1/endpoints/admin/billing_invoices.py`
- `app/schemas/billing_history.py`
- `app/services/billing_history_service.py`

## Endpoints utilizados

- `GET /api/v1/admin/billing-invoices`
- `GET /api/v1/admin/billing-invoices/{invoice_id}`
- `GET /api/v1/admin/billing-invoices/{invoice_id}/documents`

## Filtros reales

- `user_id`
- `status`
- `skip`
- `limit` entre 1 y 200

## Datos reales mostrados

- usuario;
- billing customer;
- suscripción;
- pago asociado;
- proveedor;
- Stripe Invoice ID;
- número de factura;
- estado;
- moneda;
- subtotal;
- descuento;
- impuestos;
- total;
- importe pagado;
- periodo;
- vencimiento;
- fecha de pago;
- metadata;
- URL alojada;
- PDF de factura.

## Documentos

El endpoint de documentos devuelve:

- `hosted_invoice_url`;
- `invoice_pdf_url`;
- `available`;
- `message`.

El BackOffice abre estas URLs en una pestaña nueva. No descarga el PDF a través del backend porque el endpoint actual solo entrega las URLs de Stripe.

## Limitaciones reales

El backend actual no expone endpoints administrativos para:

- crear facturas;
- editar partidas;
- reenviar facturas;
- anular facturas;
- marcar facturas como incobrables;
- sincronizar manualmente una factura.

Por eso este ZIP no inventa esos botones.

## Incluye

- Ruta `/dashboard/billing/invoices`.
- Acceso Comercial → Facturas.
- Listado paginado con total real.
- Filtros por usuario y estado.
- Búsqueda local en la página.
- Métricas por estado.
- Detalle completo.
- Desglose de importes.
- Fechas y periodo.
- Metadata.
- Abrir Hosted Invoice.
- Abrir PDF.
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

1. Abre `/dashboard/billing/invoices`.
2. Filtra por usuario y estado.
3. Abre una factura.
4. Revisa importes y fechas.
5. Abre la factura alojada cuando exista.
6. Abre el PDF cuando exista.
7. Comprueba el mensaje cuando no haya documentos.
8. Prueba paginación.
9. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Billing - ZIP 08F Invoices"
git push
```
