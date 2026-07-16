# 13A — Analítica completa

## Backend verificado

El backend expone un único endpoint administrativo:

```text
GET /api/v1/admin/analytics?days=30
```

El parámetro `days` admite valores entre 1 y 365.

## Métricas reales disponibles

### Resumen

- total de usuarios;
- usuarios activos;
- total de jobs Try-On;
- jobs completados;
- jobs fallidos;
- tokens emitidos;
- tokens consumidos;
- costo GPU estimado;
- costo GPU real;
- archivos almacenados.

### Series temporales

- usuarios por día;
- jobs Try-On por día;
- tokens emitidos por día;
- tokens consumidos por día;
- costos GPU estimados y reales por día.

## Incluye

- Habilitación de Principal → Analítica.
- Ruta `/dashboard/analytics`.
- Filtros de 7, 30, 90, 180 y 365 días.
- KPIs.
- Tasas de actividad, éxito y fallo.
- Gráficas SVG sin dependencias adicionales.
- Costos formateados en USD.
- Estados de carga y error.
- Diseño responsive.

## Alcance del módulo

Como el backend actual ofrece un solo endpoint que ya entrega todo el contrato analítico disponible, este ZIP completa el módulo sin inventar:

- retención;
- países;
- dispositivos;
- ARPU;
- LTV;
- conversiones;
- métricas RunPod detalladas.

Esas métricas no existen todavía en el contrato del backend.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

Abre:

`http://127.0.0.1:3000/dashboard/analytics`

## Git

```powershell
git add .
git commit -m "Analytics - Complete dashboard"
git push
```
