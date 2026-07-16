# 14B — Resolución de eventos operativos

## Endpoint real utilizado

```text
POST /api/v1/admin/operational-events/{event_id}/resolve
```

## Funcionalidad agregada

Desde el detalle de un evento sin resolver ahora se puede:

- escribir una nota de resolución;
- confirmar la operación;
- marcar el evento como resuelto;
- actualizar inmediatamente el listado;
- disminuir el contador de eventos pendientes;
- mostrar el usuario que resolvió;
- mostrar la fecha de resolución;
- conservar la nota registrada.

## Validaciones

- La nota de resolución es obligatoria.
- El formulario no aparece si el evento ya está resuelto.
- La interfaz evita resolver accidentalmente mediante confirmación.
- Los errores del backend se muestran sin perder el estado actual.

## Estado del módulo

Con este ZIP queda cerrado:

**14 — Monitoreo y eventos operativos**

Incluye:

- salud de servicios;
- recursos del sistema;
- actualización automática;
- listado y resumen de eventos;
- filtros;
- detalle técnico;
- excepciones;
- JSON de detalles;
- resolución administrativa.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre `/dashboard/monitoring/events`.
2. Selecciona un evento no resuelto.
3. Escribe una nota.
4. Marca el evento como resuelto.
5. Comprueba que cambia el estado.
6. Recarga y confirma que la resolución persiste.

## Git

```powershell
git add .
git commit -m "Monitoring - Resolve operational events and close module"
git push
```
