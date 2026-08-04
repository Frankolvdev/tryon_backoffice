# UI de política de cobro por resultado

Agrega una tarjeta debajo de **Valor de 1 Token (USD)** con cuatro filas configurables y dos interruptores por fila:

- Cobrar infraestructura.
- Aplicar ganancia.

Los cambios se guardan en `/api/admin/execution-billing-policy` y aplican únicamente a ejecuciones futuras.

## Build

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```
