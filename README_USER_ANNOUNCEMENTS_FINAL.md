# 10D — User Announcements Final

## Backend verificado

Este ZIP usa exclusivamente:

```text
POST /api/v1/admin/user-announcements
```

El backend crea una notificación:

- global;
- con `source=announcement`;
- con `event_type=system_announcement`;
- visible para usuarios finales;
- registrada en auditoría.

## Campos soportados

- tipo;
- prioridad;
- título;
- mensaje;
- URL y etiqueta de acción;
- URL de imagen;
- acción requerida;
- fecha de publicación;
- expiración;
- metadata.

## Limitación real

El backend actual no expone endpoints administrativos específicos para:

- listar únicamente anuncios;
- editar anuncios;
- eliminar anuncios;
- cancelar anuncios programados.

Por ello este ZIP no inventa esas funciones.

## Ruta

```text
/dashboard/notifications/announcements
```

## Cierre del módulo Notificaciones

Quedan cubiertos:

- 10A Centro de notificaciones.
- 10B Preferencias y canales.
- 10C Historial y reintento de entregas.
- 10D Anuncios globales para usuarios finales.

## Instalación

Extrae directamente sobre:

```text
F:\PROYECTOS PERSONALES\TRYON\backoffice
```

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Git

```powershell
git add .
git commit -m "Notifications - User announcements final"
git push
```
