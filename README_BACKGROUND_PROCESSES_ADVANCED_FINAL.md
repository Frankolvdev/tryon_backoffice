# 12C — Procesos avanzados y cierre

## Endpoints reales utilizados

- `GET /api/v1/admin/background-jobs/handlers`
- `POST /api/v1/admin/background-jobs`

El detalle ya utiliza:

- intentos;
- dependencias;
- dependientes;
- payload;
- result;
- metadata;
- error_details.

## Incluye

- Explorador de handlers registrados.
- Creación manual de procesos.
- Colas reales del backend.
- Modos de ejecución reales.
- Prioridades reales.
- Configuración de intentos, timeout y backoff.
- Payload y metadata JSON.
- Visualizador completo de payload.
- Visualizador completo de resultado.
- Visualizador de metadata.
- Visualizador de detalles del error.
- Historial de intentos.
- Dependencias y dependientes.
- Exportación local del detalle completo a JSON.
- Cierre del módulo Procesos en segundo plano.

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
git commit -m "Background jobs - Advanced tools and module closure"
git push
```
