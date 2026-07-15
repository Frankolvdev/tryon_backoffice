# 06C — System Settings Advanced Final

## Backend utilizado

Este cierre reutiliza únicamente:

- `GET /api/v1/admin/system-settings/grouped`
- `PATCH /api/v1/admin/system-settings/{setting_id}`

No agrega claves, categorías ni endpoints nuevos.

## Incluye

- Ruta `/dashboard/settings/advanced`.
- Vista agrupada por categorías reales del backend.
- Resumen de configuraciones totales, editables, públicas, sensibles y que requieren reinicio.
- Categorías plegables.
- Búsqueda global.
- Edición mediante el componente ya integrado en 06A.
- Advertencias para valores sensibles y reinicio.
- Nueva pestaña de Configuración avanzada.
- Loading global.
- Error global con reintento.
- Responsive.
- Sin dependencias nuevas.

## Cierre del módulo

Después de instalar este paquete quedan disponibles:

- Estado operativo global.
- Modo mantenimiento.
- Registro y Try-On habilitados/deshabilitados.
- Mensajes público e interno.
- Seed de defaults.
- Validación administrativa.
- Configuración general.
- Configuración pública.
- Configuración avanzada por categorías.
- Edición de string, integer, float, boolean y JSON.
- Indicadores de valores públicos, sensibles, editables y que requieren reinicio.

## Funciones no inventadas

No se añadió:

- login social;
- selector OTP/enlace;
- nuevos proveedores;
- creación arbitraria de settings;
- eliminación de settings;
- edición masiva;

porque esas funciones no forman parte de los endpoints usados por este módulo.

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
2. Recorre General, Pública y Avanzada.
3. Busca una configuración por clave.
4. Abre y cierra categorías.
5. Edita un valor permitido.
6. Verifica valores sensibles.
7. Comprueba indicadores de reinicio.
8. Prueba errores con el backend apagado.
9. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "System Settings - ZIP 06C Advanced Final"
git push
```
