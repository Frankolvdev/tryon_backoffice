# 01 — Try-On Foundation

Este ZIP es el primer paquete de implementación del único módulo **Try-On**.

## Incluye

- Navegación habilitada para Try-On.
- Rutas base:
  - `/dashboard/tryon`
  - `/dashboard/tryon/jobs`
  - `/dashboard/tryon/workflows`
  - `/dashboard/tryon/integrations`
- Tipos iniciales del dominio.
- Normalizador defensivo para la respuesta de jobs.
- Resumen conectado al endpoint administrativo existente:
  - `GET /api/v1/admin/tryon-jobs?skip=0&limit=100`
- Componentes visuales reutilizables con el look & feel actual.
- Estados de carga, error y vacío.
- Diseño responsive.

## Instalación

Extrae el ZIP sobre la raíz de:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Acepta reemplazar archivos.

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

No se agregan dependencias nuevas.

## Pruebas

1. Abre `/dashboard/tryon`.
2. Comprueba que el sidebar navegue a Try-On, Trabajos, Workflows y Motor IA.
3. Verifica que el resumen muestre datos reales o un estado vacío.
4. Comprueba la vista en escritorio y móvil.

## Siguientes paquetes del mismo módulo

- `02_tryon_jobs.zip`
- `03_tryon_workflows.zip`
- `04_tryon_integrations.zip`
- `05_tryon_final.zip`

El módulo Try-On no se considera cerrado hasta instalar y probar el paquete 05.
