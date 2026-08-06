# MegaZIP BackOffice — Caja de infraestructura FIFO por bolsa

## Alcance
- Conserva la caja verde sin modificar su funcionamiento.
- Muestra el efectivo de infraestructura todavía disponible para fondear.
- Permite registrar fondeos a Modal, RunPod, Beam u otro proveedor.
- Muestra la distribución del fondeo entre bolsas concretas.
- Diferencia efectivo liberado a utilidad y crédito ya fondeado al vencer.
- Actualiza el reinicio de datos para incluir los nuevos libros financieros.

## Aplicación
Extraer directamente sobre la raíz del BackOffice.

## Validación local
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
