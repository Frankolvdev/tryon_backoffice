# MegaZIP 2 — BackOffice

## Alcance

- Reglas de pricing con ganancia fija en USD, duración estimada inicial y margen técnico.
- Nueva sección “Reglas de pricing aplicadas”.
- Tabla editable de costo USD/segundo para las GPU de Modal, RunPod y Beam.
- Trabajos IA con “Tiempo backend” y “Tiempo real”.
- Botón `$` con el desglose persistido por el backend.
- Estados, cancelaciones y acciones existentes conservados.

## Aplicación

Descomprime directamente sobre la raíz de `tryon_backoffice`.

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm install
npm run build
npm run dev
```

## Git

```powershell
git add .
git commit -m "feat: add dynamic pricing administration and billing breakdown"
git push
```

## Nota de validación

La validación estructural de los archivos fue correcta. El build no pudo ejecutarse en el entorno de generación porque el registro npm interno no tenía disponible `zustand@5.0.14`; debe validarse con `npm install` y `npm run build` en el entorno local del proyecto.
