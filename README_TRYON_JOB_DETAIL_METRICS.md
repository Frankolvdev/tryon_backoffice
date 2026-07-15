# 02B2 — Try-On Job Detail Metrics

Paquete acumulativo del módulo Try-On.

## Incluye

- GPU estimada.
- GPU real.
- Costo GPU estimado.
- Costo GPU real.
- Diferencia entre tiempo estimado y real.
- Diferencia entre costo estimado y real.
- Tiempo total calculado entre creación y finalización.
- Estados visuales para sobreconsumo, ahorro y datos no disponibles.
- Integración dentro del detalle existente.
- Responsive completo.

No se agregan endpoints ni dependencias nuevas. Los datos provienen del mismo:

- `GET /api/v1/admin/tryon-jobs/{job_id}`

## Instalación

Extrae el ZIP sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre un job.
2. Comprueba GPU estimada y real.
3. Comprueba costos estimado y real.
4. Prueba un job completado y uno pendiente.
5. Revisa móvil.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 02B2 Job Detail Metrics"
git push
```
