# 07A — Audit Logs Foundation

## Backend revisado

El endpoint básico real de auditoría es:

- `GET /api/v1/admin/audit-logs`

Parámetros admitidos:

- `skip` — mínimo 0.
- `limit` — mínimo 1, máximo 200.

Respuesta real:

- `id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `description`
- `ip_address`
- `user_agent`
- `created_at`

## Incluye

- Ruta `/dashboard/audit`.
- Acceso habilitado desde Administración → Auditoría.
- Listado paginado de 100 registros.
- Búsqueda local sobre la página cargada.
- Métricas de acciones, actores y entidades.
- Tabla responsive con scroll horizontal.
- Detalle modal del evento.
- IP y User Agent.
- Fechas en formato local.
- Estados de carga, vacío y error.
- Sin dependencias nuevas.
- Sin endpoints inventados.

## Limitaciones reales del endpoint básico

Este endpoint devuelve una lista simple y solo admite `skip` y `limit`. Por eso:

- La búsqueda se aplica únicamente a la página cargada.
- No existe un total global en la respuesta.
- El botón siguiente se habilita cuando la página contiene 100 registros.
- No existe un endpoint individual de detalle; el modal usa el objeto ya cargado.

El backend también contiene módulos avanzados de entradas, operaciones, exportación, mantenimiento y restauración de auditoría. Se integrarán en ZIP posteriores después de revisar sus contratos exactos.

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

1. Abre `/dashboard/audit`.
2. Revisa la primera página.
3. Busca por acción, entidad, ID, actor o IP.
4. Abre el detalle de un evento.
5. Prueba anterior y siguiente.
6. Apaga temporalmente el backend para revisar el estado de error.
7. Prueba escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Audit - ZIP 07A Logs Foundation"
git push
```
