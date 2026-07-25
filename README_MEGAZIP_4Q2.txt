MEGAZIP 4Q2 - MODAL MINIMUM VALUE FIX

Corrige el error:
Input should be greater than or equal to 60

Los campos Modal de apagado por inactividad y timeout de ejecución
se normalizan antes de guardar y nunca se envían por debajo de 60 segundos.

Aplicación:
Descomprimir encima del BackOffice después de 4Q y 4Q1.

Validación:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
