# Tools Generation · Generador de proporciones — BackOffice

Agrega un grupo nuevo `Tools Generation` y la página:

`/dashboard/tools-generation/body-proportions`

## Funciones
- Tabs Mujer/Hombre; Hombre queda preparado aunque aún no tenga workflow.
- Carga de workflow API JSON por sexo.
- Mapeo visual de nodos/inputs de ComfyUI.
- Configuración de límites, compensaciones y valores fijos.
- Filas/perfiles numéricos sin depender de Small/Medium/Big/Huge.
- `profile_key` estable (`W-P001`, `M-P001`, etc.).
- Crear fila, guardar, generar, regenerar/sobrescribir, eliminar.
- Crear `Siguiente compensado` usando la fórmula configurada.
- Insertar perfil intermedio 50% entre dos filas existentes.
- Preview de la imagen almacenada en cada fila.
- Generación secuencial de todas las filas visibles.

## Compilación

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```
