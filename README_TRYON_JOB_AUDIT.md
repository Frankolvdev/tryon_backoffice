# 02C3 — Try-On Job Audit

Paquete acumulativo del módulo Try-On.

## Endpoint utilizado

- `GET /api/v1/admin/external-ai-jobs?skip=0&limit=200`

También reutiliza los campos ya disponibles del Try-On Job cargado mediante:

- `GET /api/v1/admin/tryon-jobs/{job_id}`

## Incluye

- Línea de tiempo operativa.
- Creación del Try-On Job.
- Actualizaciones de estado.
- Finalización.
- Creación del External AI Job.
- Inicio y finalización de RunPod.
- Provider Job ID.
- Errores del job Try-On.
- Errores de la ejecución externa.
- Estados visuales por éxito, advertencia y error.
- Actualización manual del historial.
- Responsive.
- Sin dependencias nuevas.

## Importante

El backend no expone un endpoint de auditoría específico por Try-On Job. Este panel no inventa uno: construye la línea de tiempo exclusivamente con fechas, estados y ejecuciones External AI realmente disponibles.

## Instalación

Extrae el ZIP directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre un job con ejecución RunPod.
2. Comprueba la línea de tiempo.
3. Abre un job fallido.
4. Comprueba los errores.
5. Prueba `Actualizar historial`.
6. Revisa móvil.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 02C3 Job Audit"
git push
```
