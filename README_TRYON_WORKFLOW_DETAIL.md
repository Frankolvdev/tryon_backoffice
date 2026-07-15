# 03B — Try-On Workflow Detail

Paquete acumulativo del módulo Try-On.

## Endpoint utilizado

- `GET /api/v1/admin/workflow-definitions/{workflow_definition_id}`

## Incluye

- Detalle real por ID.
- Nombre, clave, descripción y versión.
- Categoría.
- Estado activo/inactivo.
- Indicador predeterminado.
- Modos de ejecución.
- Número de nodos.
- Número de parámetros.
- Creador y fechas.
- JSON completo del workflow.
- JSON del esquema de parámetros.
- JSON de metadata.
- Buscar dentro de cada JSON.
- Copiar.
- Descargar.
- Expandir y contraer.
- Estados de carga y error.
- Responsive.
- Sin dependencias nuevas.

## Instalación

Extrae el ZIP directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre `/dashboard/tryon/workflows`.
2. Abre un workflow.
3. Comprueba resumen y estados.
4. Busca dentro de los JSON.
5. Copia y descarga cada JSON.
6. Prueba un ID inexistente.
7. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 03B Workflow Detail"
git push
```
