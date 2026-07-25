MEGAZIP FINAL BACKOFFICE

Archivo incluido:
- src/components/runtime-builder/runtime-mega3-panel.tsx

Corrige el comando Docker Run interactivo para PowerShell, CMD, Bash y una línea.

Ahora refleja:
- image_name real
- container_name
- gpu_mode
- host_port y container_port
- restart_policy
- models/workflows/output volumes y mount paths
- extra_arguments

Regla Docker:
- restart_policy=no -> agrega --rm
- otra política -> agrega --restart y omite --rm
