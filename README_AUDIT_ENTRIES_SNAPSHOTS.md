# 07C — Audit Entries & Snapshots

## Backend revisado

Este paquete usa exclusivamente los endpoints reales definidos en:

`app/api/v1/endpoints/admin/audit_entries.py`

## Endpoints utilizados

- `GET /api/v1/admin/audit-entries`
- `GET /api/v1/admin/audit-entries/summary`
- `GET /api/v1/admin/audit-entries/{entry_id}/diff`
- `GET /api/v1/admin/audit-entries/entity/{entity_type}/{entity_id}`

## Contratos reales

La lista avanzada admite filtros de backend para:

- actor;
- email;
- tipo de actor;
- acción;
- tipo e ID de entidad;
- éxito o fallo;
- correlation ID;
- request ID;
- restaurabilidad;
- búsqueda;
- fecha inicial y final;
- paginación hasta 500 registros por petición.

La respuesta incluye:

- snapshot anterior;
- snapshot posterior;
- diff persistido;
- metadata;
- errores;
- información de correlación;
- restaurabilidad;
- origen de restauración.

## Incluye

- Ruta `/dashboard/audit/entries`.
- Nueva pestaña `Entradas avanzadas`.
- Filtros reales del backend.
- Paginación con total real.
- Resumen global.
- Inspector avanzado.
- Snapshot anterior y posterior.
- Diferencias campo por campo.
- Campos agregados, modificados y eliminados.
- Metadata.
- Historial por entidad.
- Estado exitoso, fallido y restaurable.
- Responsive.
- Sin dependencias nuevas.
- Sin endpoints inventados.

## No incluido todavía

La exportación JSON/CSV y la restauración se reservan para el ZIP 07D de cierre, porque usan endpoints y esquemas diferentes.

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

1. Abre `/dashboard/audit/entries`.
2. Prueba filtros de éxito, restaurabilidad y fechas.
3. Abre una entrada.
4. Revisa los snapshots.
5. Revisa el diff.
6. Verifica el historial de una entidad.
7. Prueba paginación.
8. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Audit - ZIP 07C Entries Snapshots"
git push
```
