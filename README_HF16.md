# MegaZIP 3B HF16 — Docker Run interactivo real

## Corrección

El BackOffice ahora genera el comando de ejecución usando:

- `docker run --rm -it`
- `--gpus all` cuando GPU está en NVIDIA o Auto
- nombre de contenedor configurado
- puertos configurados
- volúmenes configurados
- imagen local basada en `Nombre del build`
- tag `:1.0.0` cuando el build no incluye un tag

Con esta configuración:

- Nombre del build: `ia-comfyui-python-build`
- Nombre de imagen: `ia-comfyui-python`
- Nombre de contenedor: `ia-comfyui-python-container`

el comando termina usando:

`ia-comfyui-python-build:1.0.0`

El campo `Nombre de imagen` se conserva como metadato de publicación, pero ya no sustituye por error la imagen local compilada.

## Alcance

Solo reemplaza:

`src/components/runtime-builder/runtime-mega3-panel.tsx`

No modifica backend, schemas, base de datos, Dockerfile ni Runtime Builder.
