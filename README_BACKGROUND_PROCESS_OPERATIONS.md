# 12B — Operaciones de procesos en segundo plano

## Backend utilizado

Este ZIP usa exclusivamente endpoints reales:

```text
POST /api/v1/admin/background-jobs/{job_id}/cancel
POST /api/v1/admin/background-jobs/{job_id}/retry
POST /api/v1/admin/background-job-operations/maintenance
```

## Operaciones agregadas

### Cancelar

Disponible únicamente cuando:

- el proceso permite cancelación;
- el estado todavía admite cancelación.

Permite escribir un motivo opcional.

### Reintentar

Disponible para procesos:

- failed;
- timed_out;
- dead_letter;
- canceled.

Permite decidir si se reinicia el contador de intentos.

### Mantenimiento

Permite:

- recuperar leases expirados;
- volver a señalar colas listas;
- limitar el número de elementos inspeccionados;
- ver procesos recuperados;
- ver procesos enviados a dead letter;
- ver colas señaladas.

## No incluido todavía

El backend también permite:

- crear procesos manualmente;
- consultar handlers;
- actualizar progreso manualmente;
- consultar intentos y dependencias por endpoints separados.

La pantalla ya muestra intentos y dependencias dentro del detalle. La creación manual y handlers quedarán para el siguiente ZIP, porque son herramientas más avanzadas.

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
git commit -m "Background jobs - Operations and maintenance"
git push
```
