# 02B1 — Try-On Job Detail Core

Paquete acumulativo del módulo Try-On.

## Endpoint utilizado

- `GET /api/v1/admin/tryon-jobs/{job_id}`

## Incluye

- Carga real del job por ID.
- Encabezado, estado e ID.
- Usuario.
- Tipo de artículo.
- Calidad.
- Tokens.
- Workflow.
- RunPod Job ID.
- IDs de archivos asociados.
- Fechas principales.
- Prompt.
- Error.
- Botones para copiar valores.
- Estados de carga y error.
- Diseño responsive.
- Mantiene el look & feel negro, grafito y rojo.

## Instalación

Extrae el ZIP sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

No requiere dependencias nuevas.

## Pruebas

1. Abre `/dashboard/tryon/jobs`.
2. Pulsa `Ver` en un trabajo real.
3. Comprueba estado, usuario, workflow, RunPod y archivos.
4. Prueba los botones de copiar.
5. Comprueba prompt y error.
6. Actualiza la página.
7. Prueba una URL con un ID inexistente.
8. Revisa la vista móvil.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 02B1 Job Detail Core"
git push
```
