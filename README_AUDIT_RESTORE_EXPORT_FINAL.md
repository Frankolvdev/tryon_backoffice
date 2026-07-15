# 07D — Audit Restore & Export Final

## Backend revisado

Este paquete utiliza exclusivamente endpoints reales del backend.

## Exportación

- `POST /api/v1/admin/audit-entries/export/json`
- `POST /api/v1/admin/audit-entries/export/csv`

El contrato admite:

- actor;
- email y tipo de actor;
- acción;
- tipo e ID de entidad;
- resultado;
- correlation ID;
- request ID;
- restaurabilidad;
- búsqueda;
- rango de fechas;
- máximo de 1 a 100000 registros.

La descarga conserva el filename enviado por `Content-Disposition` y lee `X-Exported-Records`.

## Restauración

- `GET /api/v1/admin/audit-restorations/entity-types`
- `GET /api/v1/admin/audit-entries/{audit_entry_id}/restore-preview`
- `POST /api/v1/admin/audit-entries/{audit_entry_id}/restore`

El flujo obliga a:

1. ingresar un Audit Entry ID;
2. generar una vista previa;
3. revisar estado actual y restaurable;
4. escribir una razón;
5. confirmar la operación;
6. ejecutar la restauración.

## Seguridad real del backend

El servicio excluye campos protegidos como:

- ID;
- created_at y updated_at;
- contraseñas y hashes;
- access y refresh tokens;
- API keys;
- secretos;
- credenciales cifradas;
- private keys.

También:

- valida que la entrada sea restaurable;
- exige snapshot anterior;
- limita campos mutables por entidad;
- puede validar concurrencia con `expected_updated_at`;
- crea una nueva entrada de auditoría;
- invalida cachés de workflows, pricing, settings, feature flags, integraciones, planes y paquetes cuando corresponde.

## Incluye

- Ruta `/dashboard/audit/restore-export`.
- Pestaña final del módulo.
- Exportación JSON y CSV.
- Filtros de exportación.
- Descarga binaria real.
- Vista previa de restauración.
- Tipos de entidad registrados.
- Campos modificados, ignorados y ausentes.
- Estado actual y estado a restaurar.
- Razón obligatoria.
- Control opcional de concurrencia.
- Confirmación explícita.
- Resumen del resultado.
- Responsive.
- Sin dependencias nuevas.

## Cierre del módulo

Con este ZIP quedan terminados:

- 07A Registros básicos.
- 07B Operaciones y mantenimiento.
- 07C Entradas, snapshots y diferencias.
- 07D Restauración y exportación.

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

1. Abre `/dashboard/audit/restore-export`.
2. Exporta JSON.
3. Exporta CSV.
4. Prueba filtros y límite.
5. Copia un ID restaurable desde Entradas avanzadas.
6. Genera la vista previa.
7. Revisa campos protegidos e ignorados.
8. Ejecuta una restauración únicamente sobre datos de prueba.
9. Confirma que aparezca una nueva entrada de auditoría.
10. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Audit - ZIP 07D Restore Export Final"
git push
```
