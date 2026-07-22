# ZIP 36 — Desconexión de wires y nodo Output obligatorio

## Cambios

- Los cables se pueden desconectar seleccionándolos y pulsando Supr o Backspace.
- También se pueden desconectar haciendo doble clic sobre el cable.
- La desconexión se persiste en el Backend para pasos Python, Workflow y el Output final.
- El bloque final ahora se llama `Output` y siempre aparece.
- Si el módulo todavía no tiene salidas configuradas, se crea visualmente un puerto `output` obligatorio.
- Al conectar una salida de Workflow/Python al bloque Output se guarda `source_step_key` y `source_path` mediante el endpoint real de actualización del módulo.
- Solo puede existir una conexión activa por cada puerto final del bloque Output.

## Verificación

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```
