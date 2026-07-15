# 05 — Integrations Health Final

## Endpoints reales utilizados

- `GET /api/v1/admin/integrations`
- `POST /api/v1/admin/integrations/{provider}/health`

## Incluye

- Vista global de salud.
- Conteo de integraciones saludables.
- Conteo de integraciones con atención.
- Conteo de integraciones sin comprobar.
- Conteo de integraciones deshabilitadas.
- Filtros por estado.
- Health check individual.
- Comprobación secuencial de todas las integraciones habilitadas.
- Últimos mensajes de salud.
- Última fecha de comprobación.
- Estado administrativo y URL base.
- Acceso desde el panel principal.
- Loading y error globales del módulo.
- Responsive.
- Sin dependencias nuevas.

## Decisión técnica

El backend no expone un endpoint masivo de health check. El botón `Comprobar todas` reutiliza secuencialmente el endpoint individual real para cada proveedor habilitado.

No se añadió historial de eventos porque este cierre no depende de un endpoint adicional no confirmado. La pantalla usa exclusivamente el estado persistido que devuelve `GET /admin/integrations`.

## Alcance final del módulo

Administrables desde el BackOffice actual:

- ComfyUI
- RunPod
- S3
- Stripe
- SMTP

Los proveedores que puedan existir como defaults pero no tengan formulario especializado aparecen como no administrables, sin inventar campos.

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
2. Entra a `Estado global`.
3. Prueba cada filtro.
4. Ejecuta un health check individual.
5. Ejecuta `Comprobar todas`.
6. Deshabilita una integración y confirma que no se compruebe.
7. Apaga temporalmente ComfyUI para confirmar el estado de error.
8. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Integrations - ZIP 05 Health Final"
git push
```
