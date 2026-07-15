# 03 — Integrations Payments

## Backend revisado

La integración Stripe utiliza realmente:

- `api_key` como Secret Key de Stripe.
- `webhook_secret` para validar webhooks.
- `config.currency` como moneda predeterminada.
- `config.mode` como dato informativo.

El servicio del backend asigna directamente `stripe.api_key = config.api_key`; por lo tanto, el entorno real depende de `sk_test_...` o `sk_live_...`.

## Endpoints reales utilizados

- `GET /api/v1/admin/integrations/stripe`
- `PATCH /api/v1/admin/integrations/stripe`
- `POST /api/v1/admin/integrations/stripe/health`

## Incluye

- Configuración especializada para Stripe.
- Activar y desactivar integración.
- Estado administrativo.
- Moneda ISO de tres letras.
- Secret Key.
- Publishable Key guardada dentro de `config`.
- Webhook Secret.
- Detección automática de test/live.
- Sin switch falso independiente.
- Sincronización automática de `config.mode`.
- Validación de prefijos `sk_test_`, `sk_live_`, `pk_test_` y `pk_live_`.
- Confirmación antes de guardar claves live.
- Conservación de secretos existentes al dejar campos vacíos.
- Advertencia sobre el alcance real del health check.
- Habilitación del botón Configurar en la tarjeta Stripe.
- Responsive.
- Sin dependencias nuevas.

## Health check actual

El backend no realiza una petición real a Stripe para este proveedor. Solo valida que la configuración base esté habilitada y registra qué credenciales existen.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre `/dashboard/integrations`.
2. Entra a Stripe.
3. Escribe una clave `sk_test_...`.
4. Comprueba la detección de modo de prueba.
5. Escribe una clave `sk_live_...`.
6. Comprueba la advertencia de producción.
7. Verifica que la Publishable Key corresponda al mismo entorno.
8. Guarda dejando secretos vacíos para conservar los actuales.
9. Ejecuta el health check y observa su mensaje.

## Git

```powershell
git add .
git commit -m "Integrations - ZIP 03 Payments Stripe"
git push
```
