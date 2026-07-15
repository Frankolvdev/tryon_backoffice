# 05A — Try-On Final Integration

## Objetivo

Cerrar la integración de navegación del módulo Try-On después de completar:

- Jobs.
- Detalle y acciones.
- Workflows.
- ComfyUI.
- RunPod.
- Storage.
- Monitoring & Metrics.

## Archivo modificado

- `src/config/backoffice-navigation.ts`

## Cambios

- Habilita el acceso global a Monitoreo Try-On.
- Mantiene habilitado el acceso global a Storage.
- Confirma los enlaces finales de Jobs, Workflows, ComfyUI y RunPod.
- Conserva los demás módulos todavía no desarrollados como deshabilitados.
- No agrega `monitoring-status-chart.tsx`, porque el dashboard 04D no necesita una gráfica independiente y ya representa los estados mediante componentes y métricas reales.
- No agrega endpoints ni dependencias.

## Rutas finales integradas

- `/dashboard/tryon`
- `/dashboard/tryon/jobs`
- `/dashboard/tryon/workflows`
- `/dashboard/tryon/integrations`
- `/dashboard/tryon/integrations/runpod`
- `/dashboard/tryon/integrations/storage`
- `/dashboard/tryon/integrations/monitoring`

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Acepta reemplazar el archivo.

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Verifica que `Monitoreo` ya no aparezca deshabilitado.
2. Abre Monitoreo desde el sidebar.
3. Abre Almacenamiento desde el sidebar.
4. Comprueba Jobs, Workflows, ComfyUI y RunPod.
5. Revisa el estado activo del menú en cada ruta.
6. Prueba el sidebar en escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 05A Final Integration"
git push
```
