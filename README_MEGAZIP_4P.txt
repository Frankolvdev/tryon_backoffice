MEGAZIP 4P - BACKOFFICE

Corrige la vista previa Docker interactiva:
- Siempre conserva --rm -it.
- Usa GPU, nombre, puertos e imagen configurados.
- Usa models_volume y workflows_volume cuando existen.
- Si están vacíos, usa docker_volume del exportador.
- Si también está vacío, deriva dinámicamente <nombre-base>-volume
  desde build_name.
- El mismo volumen se monta en models y workflows.
- output_volume solo se agrega cuando fue configurado.

Ejemplo con build_name ia-comfyui-python-build:
-v ia-comfyui-python-volume:/app/ComfyUI/models
-v ia-comfyui-python-volume:/app/ComfyUI/user/default/workflows

Validación:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
