# 02B3 — Try-On Job Detail Files

Paquete acumulativo del módulo Try-On.

## Endpoints utilizados

- `GET /api/v1/admin/storage/files?skip=0&limit=200`
- `GET /api/v1/admin/storage/files/{storage_file_id}/signed-url`

## Incluye

- Vista previa de la imagen de persona.
- Vista previa de la prenda o calzado.
- Vista previa del resultado.
- URL pública cuando existe.
- URL firmada temporal cuando el archivo es privado.
- Nombre original.
- Tipo MIME.
- Tamaño.
- Proveedor.
- Fecha de registro.
- Abrir archivo en otra pestaña.
- Copiar ID.
- Estados de carga, pendiente y error.
- Responsive completo.

## Comportamiento importante

El listado administrativo de almacenamiento solo permite `skip` y `limit`. Este paquete consulta los primeros 200 registros para obtener metadatos y usa el endpoint individual de URL firmada para cada ID del job.

Si el archivo no está entre esos 200 registros, la vista previa todavía puede funcionar mediante la URL firmada, pero algunos metadatos aparecerán como no disponibles.

## Instalación

Extrae el ZIP sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

No requiere dependencias nuevas.

## Pruebas

1. Abre un job real.
2. Comprueba persona, artículo y resultado.
3. Pulsa `Abrir archivo`.
4. Prueba `Copiar ID`.
5. Prueba un job sin resultado.
6. Revisa escritorio y móvil.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 02B3 Job Detail Files"
git push
```
