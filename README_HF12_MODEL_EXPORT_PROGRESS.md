# HF12 BackOffice — Progreso real del exportador

## Corrección

Al pulsar **Exportar**, la interfaz ahora muestra inmediatamente:

- guardando configuración;
- creando trabajo;
- trabajo en cola;
- fase actual;
- porcentaje;
- mensaje del backend;
- error persistente, cuando ocurra;
- resumen al terminar.

El seguimiento consulta el backend cada segundo, tolera hasta cuatro errores
transitorios y mantiene el último estado aunque `busy` cambie a `false`.

## Aplicación

Descomprime directamente en la raíz de `tryon_backoffice`:

```powershell
python apply_hf12_model_export_progress.py
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Prueba

1. Selecciona destino local.
2. Pulsa **Exportar**.
3. Debe aparecer inmediatamente “Guardando configuración…”.
4. Repite con volumen Docker.
5. Durante la copia debe mantenerse visible el estado del trabajo.
6. Si falla, el error debe permanecer en el panel y también mostrarse en el toast.

## Git

Después de probar:

```powershell
Get-ChildItem -Recurse -Filter "*.hf12.bak" | Remove-Item
git add .
git commit -m "fix: show model export progress and errors"
git push
```
