# 02B4 — Try-On Job Detail JSON

Paquete acumulativo del módulo Try-On.

## Incluye

- JSON completo del job.
- Vista contraída o expandida.
- Búsqueda local dentro del JSON.
- Copiar JSON completo.
- Descargar archivo `tryon-job-{id}.json`.
- Estado cuando no hay coincidencias.
- Integración al final del detalle del job.
- Responsive completo.
- Sin dependencias nuevas.

## Endpoint utilizado

No agrega endpoints nuevos. Reutiliza la respuesta de:

- `GET /api/v1/admin/tryon-jobs/{job_id}`

## Instalación

Extrae el ZIP sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Pruebas

1. Abre un job real.
2. Busca una clave como `status`.
3. Copia el JSON.
4. Descarga el JSON.
5. Expande y contrae el visor.
6. Revisa la vista móvil.

## Git

```powershell
git add .
git commit -m "Try-On - ZIP 02B4 Job Detail JSON"
git push
```
