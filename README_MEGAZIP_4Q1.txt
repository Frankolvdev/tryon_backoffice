MEGAZIP 4Q1 - BACKOFFICE CONTROLLED INPUTS FIX

Corrige el warning de React:
A component is changing a controlled input to be uncontrolled.

Causa:
Las instalaciones existentes pueden devolver temporalmente null/undefined para
los nuevos campos Modal hasta que el backend y la configuración persistida estén
actualizados. React recibía primero un número/string y después undefined.

Corrección:
- Mapeo único con valores Modal predeterminados.
- Inputs numéricos siempre controlados.
- Select GPU siempre controlado.
- Compatibilidad con configuraciones antiguas que todavía no contienen campos Modal.

Aplicación:
Descomprimir encima del BackOffice.

Validación:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
