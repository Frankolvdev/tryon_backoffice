# HF10 — Runtime Configuration como fuente única

Descomprime este ZIP directamente en la raíz de `tryon_backoffice` y ejecuta:

```powershell
python apply_hf10_runtime_configuration.py
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

Resultado:

- Guardar adopta la respuesta realmente persistida.
- `build_name`, `image_name` y `container_name` permanecen al recargar.
- Se eliminan de la interfaz `Nombre visible` y `Nombre técnico del runtime`.
- Versión, Python y los demás campos quedan intactos.
