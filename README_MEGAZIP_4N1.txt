MEGAZIP 4N1 - HOTFIX BACKOFFICE

Causa:
La configuración guardada anteriormente puede no incluir image_name u otros
campos nuevos. El componente llamaba .trim() directamente sobre undefined.

Corrección:
- Todos los campos del comando Docker se normalizan de forma segura.
- image_name ausente usa build_name.
- build_name ausente usa tryon-runtime:latest.
- puertos ausentes usan 8190:8188.
- restart_policy ausente usa no.
- extra_arguments ausente usa un arreglo vacío.
- volúmenes incompletos se omiten sin romper la pantalla.

Aplicación:
Descomprimir sobre la raíz del BackOffice y reemplazar el archivo incluido.

Validación:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
