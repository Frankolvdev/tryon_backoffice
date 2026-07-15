# 07B — Audit Operations & Maintenance

## Backend revisado

Este paquete usa exclusivamente los endpoints reales definidos en:

`app/api/v1/endpoints/admin/audit_operations.py`

## Endpoints utilizados

- `GET /api/v1/admin/audit-operations/statistics`
- `POST /api/v1/admin/audit-operations/retention`
- `POST /api/v1/admin/audit-operations/self-test`

## Contratos reales

### Estadísticas

Parámetros:

- `period_days`: 1 a 3650.
- `top_limit`: 1 a 100.

Incluye:

- total;
- exitosas;
- fallidas;
- restaurables;
- restauraciones;
- tasa de éxito;
- métricas diarias;
- acciones principales;
- entidades principales;
- tipos de actor;
- actores principales.

### Retención

Permite configurar:

- antigüedad de entradas exitosas;
- antigüedad de entradas fallidas;
- antigüedad de eventos leídos;
- preservación de entradas restaurables;
- preservación de acciones de restauración;
- preservación de entradas fallidas;
- tamaño de lote entre 1 y 10000.

### Autodiagnóstico

Comprueba:

- snapshots;
- redacción;
- diferencias;
- creación en base de datos;
- lectura;
- eliminación.

## Incluye

- Ruta `/dashboard/audit/operations`.
- Pestañas internas del módulo Auditoría.
- Estadísticas avanzadas.
- Rankings de acciones y entidades.
- Autodiagnóstico.
- Resultado técnico del autodiagnóstico.
- Formulario de retención con confirmación.
- Resumen del resultado de retención.
- Validaciones alineadas con FastAPI.
- Responsive.
- Sin dependencias nuevas.

## Advertencia

La retención elimina registros permanentemente. Las opciones de preservación permanecen activadas por defecto y el BackOffice solicita confirmación antes de ejecutar la operación.

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
git commit -m "Audit - ZIP 07B Operations Maintenance"
git push
```
