# 15B — Editor de traducciones y cierre

## Backend verificado

Este ZIP usa exclusivamente:

```text
GET /api/v1/admin/i18n/translations
POST /api/v1/admin/i18n/translations
PUT /api/v1/admin/i18n/translations/{translation_id}
```

## Filtros reales

- `locale_code`
- `namespace`
- `search`
- `is_active`
- `skip`
- `limit`

## Incluye

- listado de traducciones;
- búsqueda;
- filtro por idioma;
- filtro por namespace;
- filtro por estado;
- creación;
- edición;
- contenido HTML;
- activación y desactivación;
- descripción interna;
- detalle completo;
- fechas de creación y actualización.

## Nota del contrato

El backend calcula el `namespace` a partir de la clave de traducción. Por eso el formulario solicita una clave como:

```text
auth.login.title
```

y no pide namespace por separado.

## Estado del módulo

Con este ZIP queda cerrado:

**15 — Internacionalización**

Quedan cubiertos:

- idiomas;
- formatos;
- monedas;
- zonas horarias;
- fallback;
- datos iniciales;
- traducciones.

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
git commit -m "I18n - Translation editor and module closure"
git push
```
