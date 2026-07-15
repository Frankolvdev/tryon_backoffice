# 03D — Try-On Workflow Management

## Endpoints reales utilizados

- `PATCH /api/v1/admin/workflow-definitions/{workflow_id}`
- `POST /api/v1/admin/workflow-definitions/{workflow_id}/versions`
- `POST /api/v1/admin/workflow-definitions/{workflow_id}/set-default`

## Incluye

- Activar workflow.
- Desactivar workflow.
- Marcar como predeterminado para su categoría.
- Crear una nueva versión.
- Edición del JSON antes de crear la versión.
- Esquema de parámetros.
- Metadata.
- Modos de ejecución.
- Activar nueva versión.
- Marcar nueva versión como predeterminada.
- Confirmaciones.
- Validaciones JSON.
- Redirección al detalle de la nueva versión.
- Responsive.
- Sin dependencias nuevas.

## No incluido

El backend no expone endpoints para:

- eliminar workflow;
- duplicar workflow fuera del flujo de versiones;
- restaurar una versión anterior.

No se inventaron esas acciones.

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
git commit -m "Try-On - ZIP 03D Workflow Management"
git push
```
