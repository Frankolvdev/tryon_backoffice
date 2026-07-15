# 08C — User Subscriptions

## Backend revisado

Este paquete usa exclusivamente los endpoints definidos en:

`app/api/v1/endpoints/admin/subscriptions.py`

y los contratos de:

`app/schemas/subscription.py`

## Endpoints utilizados

- `GET /api/v1/admin/subscriptions`
- `POST /api/v1/admin/subscriptions/users/{user_id}/cancel-at-period-end`
- `POST /api/v1/admin/subscriptions/users/{user_id}/cancel-immediately`
- `POST /api/v1/admin/subscriptions/users/{user_id}/reactivate`
- `POST /api/v1/admin/subscriptions/users/{user_id}/change-plan`
- `POST /api/v1/admin/subscriptions/users/{user_id}/sync`

## Filtros reales

- `user_id`
- `status`
- `plan_id`
- `skip`
- `limit` de 1 a 200

## Operaciones reales

### Cambiar plan

Payload:

```json
{
  "new_plan_key": "pro_monthly",
  "proration_behavior": "create_prorations"
}
```

Valores admitidos para `proration_behavior`:

- `always_invoice`
- `create_prorations`
- `none`

### Cancelación

- al final del periodo;
- inmediata.

### Reactivación

Elimina una cancelación programada cuando el proveedor lo permite.

### Sincronización

Consulta el proveedor y actualiza el estado local.

## Incluye

- Ruta `/dashboard/billing/subscriptions`.
- Acceso Comercial → Suscripciones.
- Listado paginado.
- Filtros de backend.
- Búsqueda local en la página.
- Estado, plan, periodo, tokens y proveedor.
- Cambio de plan.
- Cancelación al final del periodo.
- Cancelación inmediata con confirmación.
- Reactivación.
- Sincronización.
- Actualización inmediata de la fila.
- Estados de carga, error y vacío.
- Responsive.
- Sin dependencias nuevas.
- Sin endpoints inventados.

## Importante

El backend administra una suscripción por usuario mediante rutas basadas en `user_id`. Las operaciones también generan registros de auditoría administrativa.

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

1. Abre `/dashboard/billing/subscriptions`.
2. Filtra por usuario, plan y estado.
3. Sincroniza una suscripción de prueba.
4. Programa cancelación al final del periodo.
5. Reactiva la suscripción.
6. Cambia a otro `plan_key`.
7. Prueba las tres políticas de prorrateo.
8. Cancela inmediatamente solo una suscripción de prueba.
9. Revisa los eventos en Auditoría.
10. Prueba escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Billing - ZIP 08C User Subscriptions"
git push
```
