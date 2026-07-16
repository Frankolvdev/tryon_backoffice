# 14A — Monitoreo del sistema y eventos operativos

## Organización

Los eventos operativos ya no aparecen como módulo lateral independiente.

Se integran dentro de:

```text
Sistema → Monitoreo
```

con dos pestañas:

- Estado del sistema.
- Eventos operativos.

Esto evita duplicar Auditoría y Monitoreo.

## Endpoints reales utilizados

### Monitoreo

```text
GET /api/v1/admin/monitoring
```

Incluye:

- API;
- base de datos;
- Redis;
- almacenamiento;
- CPU;
- memoria;
- disco.

### Eventos operativos

```text
GET /api/v1/admin/operational-events
GET /api/v1/admin/operational-events/summary
```

Filtros incluidos:

- severidad;
- estado resuelto;
- origen;
- búsqueda.

## Funciones incluidas

- Estado de servicios.
- Barras de recursos.
- Actualización automática cada 60 segundos.
- Resumen de eventos.
- Listado.
- Filtros.
- Detalle.
- Excepciones.
- JSON de detalles.
- Información de resolución existente.
- Navegación compartida.

## Próximo ZIP

14B agregará la acción real:

```text
POST /api/v1/admin/operational-events/{event_id}/resolve
```

y cerrará el módulo.

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
git commit -m "Monitoring - System health and operational events"
git push
```
