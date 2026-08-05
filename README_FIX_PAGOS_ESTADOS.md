# FIX BackOffice — Conciliación y estados de pagos

## Corrige
- Elimina el estado visual duplicado "Pago en proceso".
- `pending` ahora aparece como "Pendiente de confirmar".
- El detalle permite verificar con Stripe usando Checkout Session aunque todavía no exista `pi_...`.
- Explica que una conciliación recupera compras cuando faltó el webhook.

## Aplicación
```powershell
cd "F:\PROYECTOS PERSONALES\TRYON\backoffice"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```
