# 02 — Integrations AI & Storage

## Endpoints reales utilizados

- `GET /api/v1/admin/integrations/{provider}`
- `PATCH /api/v1/admin/integrations/{provider}`
- `POST /api/v1/admin/integrations/{provider}/health`

## Proveedores integrados

- ComfyUI
- RunPod
- S3 Compatible Storage

## Campos ComfyUI

- Nombre
- Estado
- Habilitada
- URL base
- Modo
- Directorio de workflows
- Timeout de polling
- Intervalo de polling
- Nodos de persona, artículo y prompt
- Credenciales genéricas admitidas por el backend

## Campos RunPod

- Nombre
- Estado
- Habilitada
- URL base
- Modo
- Timeout predeterminado
- API Key
- API Secret
- Webhook Secret

## Campos S3

- Nombre
- Estado
- Habilitada
- URL base
- Bucket
- Región
- Endpoint URL
- CDN Base URL
- Access key mediante API Key
- Secret key mediante API Secret

## Seguridad

El backend nunca devuelve los secretos. Los campos aparecen vacíos y muestran si ya existe una credencial. Dejarlos vacíos conserva los valores actuales.

## Corrección incluida

Sustituye el icono inexistente `Facebook` de Lucide por `BadgeInfo`, evitando el error de compilación del ZIP 01.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Git

```powershell
git add .
git commit -m "Integrations - ZIP 02 AI Storage"
git push
```
