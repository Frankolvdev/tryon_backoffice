# 06B — System Settings Public Platform

## Backend utilizado

Este paquete reutiliza exclusivamente:

- `GET /api/v1/admin/system-settings/grouped`
- `PATCH /api/v1/admin/system-settings/{setting_id}`
- `GET /api/v1/admin/system-status`

No crea endpoints ni claves de configuración nuevas.

## Incluye

- Navegación interna del módulo Configuración.
- Ruta `/dashboard/settings/public`.
- Vista especializada para valores con `is_public=true`.
- Resumen de mantenimiento, registro y Try-On.
- Vista del mensaje público.
- Vista administrativa de valores públicos.
- Ocultamiento de valores sensibles.
- Edición mediante el mismo endpoint genérico real.
- Búsqueda.
- Orden por `sort_order`.
- Responsive.
- Sin dependencias nuevas.

## Decisión técnica

El backend decide qué configuración es pública mediante `is_public`. El BackOffice no mantiene una lista inventada de claves; muestra dinámicamente cualquier registro público existente o agregado en el futuro.

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

1. Abre `/dashboard/settings`.
2. Comprueba las pestañas superiores.
3. Entra a `/dashboard/settings/public`.
4. Verifica que solo aparezcan valores públicos.
5. Edita un valor público permitido.
6. Comprueba que los valores sensibles se muestren ocultos.
7. Prueba mantenimiento, registro y Try-On desde la página general.
8. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "System Settings - ZIP 06B Public Platform"
git push
```
