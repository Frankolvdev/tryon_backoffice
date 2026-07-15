# 03C — Try-On Workflow Create / Edit

## Endpoints utilizados

- `POST /api/v1/admin/workflow-definitions`
- `PATCH /api/v1/admin/workflow-definitions/{workflow_id}`

## Campos reales integrados

Crear:

- key
- name
- description
- version
- category
- workflow
- parameter_schema
- execution_modes
- metadata
- is_active
- is_default

Editar:

- name
- description
- category
- workflow
- parameter_schema
- execution_modes
- metadata
- is_active
- is_default

La clave y la versión no se editan porque el backend no las admite en `WorkflowDefinitionUpdate`.

## Incluye

- Botón `Nuevo workflow`.
- Página de creación.
- Editor completo dentro del detalle.
- Validación de clave.
- Validación JSON.
- Modos ComfyUI local y RunPod Serverless.
- Estados activo y predeterminado.
- Redirección al detalle después de crear.
- Actualización inmediata después de editar.
- Responsive.
- Sin dependencias nuevas.

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
git commit -m "Try-On - ZIP 03C Workflow Create Edit"
git push
```
