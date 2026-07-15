# 06A — System Settings Foundation

## Backend revisado

Este paquete usa únicamente funcionalidades reales del backend:

- Configuraciones persistidas y agrupadas por categoría.
- Edición individual de valores.
- Creación idempotente de defaults.
- Estado operativo global.
- Validación administrativa de configuración.

## Endpoints reales utilizados

- `GET /api/v1/admin/system-settings/grouped`
- `PATCH /api/v1/admin/system-settings/{setting_id}`
- `POST /api/v1/admin/system-settings/seed-defaults`
- `GET /api/v1/admin/system-status`
- `PATCH /api/v1/admin/system-status`
- `GET /api/v1/admin/configuration/validate`

## Funciones incluidas

- Ruta `/dashboard/settings`.
- Acceso habilitado desde Sistema → Configuración.
- Modo mantenimiento.
- Registro habilitado/deshabilitado.
- Try-On habilitado/deshabilitado.
- Mensaje público.
- Mensaje interno.
- Listado agrupado de configuraciones.
- Búsqueda y filtro por categoría.
- Edición según `value_type`.
- Valores boolean, string, integer, float y JSON.
- Indicadores público, sensible, requiere reinicio y solo lectura.
- Restauración visual al valor default.
- Seed de valores predeterminados.
- Validación técnica con resultado JSON.
- Responsive.
- Sin dependencias nuevas.

## Funciones reales detectadas para próximos paquetes

El backend también contempla configuraciones públicas como:

- nombre de aplicación;
- email de soporte;
- URL del frontend;
- login por email;
- indicador de login social;
- billing;
- suscripciones;
- Try-On de calzado;
- alta calidad;
- tamaño máximo de subida.

Este foundation ya puede mostrarlas y editarlas cuando existan en los defaults. Los siguientes paquetes podrán mejorar la UX por categorías sin cambiar la API.

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

1. Abre `/dashboard/settings`.
2. Ejecuta `Crear defaults`.
3. Prueba modo mantenimiento.
4. Deshabilita y vuelve a habilitar registro.
5. Edita un valor boolean y uno string.
6. Ejecuta `Validar`.
7. Revisa cualquier configuración marcada `REINICIO`.
8. Prueba escritorio y móvil.

## Git

```powershell
git add .
git commit -m "System Settings - ZIP 06A Foundation"
git push
```
