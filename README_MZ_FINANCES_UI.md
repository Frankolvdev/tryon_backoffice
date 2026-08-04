# BackOffice — Finanzas por generación

Nueva ruta: `/dashboard/finances/generations`.

Muestra ingreso reconocido por FIFO, infraestructura, ganancia, margen y trazabilidad. Los formularios de planes y paquetes calculan la ganancia total según los tokens incluidos, no una sola generación.

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```
