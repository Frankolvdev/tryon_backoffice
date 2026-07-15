# Fix 02B1 — Try-On normalize

Corrige el nombre real del campo del backend:

- Incorrecto: `tokens_consumed`
- Correcto: `tokens_cost`

## Instalación

Extrae este ZIP sobre la raíz de `backoffice` y acepta reemplazar el archivo.

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
```

Si compila:

```powershell
npm run dev
```

## Git

Como sigue siendo una corrección del ZIP 02B1:

```powershell
git add .
git commit -m "Try-On - ZIP 02B1 Job Detail Core"
git push
```
