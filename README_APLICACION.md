# Refinamiento de Pagos y Finanzas — BackOffice

## Incluye
- Pestañas separadas: Pagos reales e Intentos de checkout.
- Descuento, cupón, importe original y total pagado visibles.
- Intentos sin PaymentIntent explicados como tales, no como errores ni pagos pendientes.
- Conciliación deshabilitada para intentos.
- Reembolsos retirados de Pagos, con nota que dirige a Caja y Bolsas.
- Cards de Finanzas por generación renombradas como uso ya procesado, sin confundirlas con Caja.

## Aplicar
```powershell
cd "F:\PROYECTOS PERSONALES\TRYON\backoffice"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```
