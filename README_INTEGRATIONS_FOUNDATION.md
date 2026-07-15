# 01 — Integrations Foundation

## Repositorios revisados

- Backend FastAPI: `Frankolvdev/tryon_backend`
- BackOffice Next.js: `Frankolvdev/tryon_backoffice`

## Endpoints reales utilizados

- `GET /api/v1/admin/integrations`
- `POST /api/v1/admin/integrations/seed-defaults`
- `POST /api/v1/admin/integrations/{provider}/health`

## Proveedores reales del backend

- Stripe
- RunPod
- ComfyUI
- S3
- SMTP
- Google OAuth
- Apple OAuth
- Facebook OAuth

## Incluye

- Ruta global `/dashboard/integrations`.
- Panel general de integraciones.
- Métricas de configuraciones registradas, habilitadas, saludables y con problemas.
- Creación idempotente de configuraciones predeterminadas.
- Health check individual.
- Estados enabled, disabled y error.
- Estados de salud unknown, healthy, degraded y down.
- Indicadores de URL y última comprobación.
- Catálogo visual por proveedor.
- Integración en el sidebar.
- Tipos TypeScript alineados con los esquemas reales.
- Responsive.
- Sin dependencias nuevas.

## No incluido todavía

La edición específica de credenciales y opciones se implementará en los siguientes ZIP por categorías. Este paquete no inventa campos específicos de proveedor.

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
2. Prueba `Crear defaults`.
3. Recarga el listado.
4. Ejecuta health check en una integración habilitada.
5. Comprueba estados vacíos y errores con el backend apagado.
6. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Integrations - ZIP 01 Foundation"
git push
```
