MEGAZIP 4N2 - HOTFIX TYPESCRIPT BACKOFFICE

Causa:
runtimeImageReference ahora recibe el objeto RuntimeLaunchSettings completo,
pero quedó una llamada antigua que enviaba solamente launch.build_name.

Corrección:
- Cambia runtimeImageReference(launch.build_name) por runtimeImageReference(launch).
- Ajusta el texto explicativo para reflejar la lógica real.

Archivo:
src/components/runtime-builder/runtime-mega3-panel.tsx

Validación:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
