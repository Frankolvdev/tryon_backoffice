# MegaZIP — BackOffice — Simulador + Administración de usuario + Almacenamiento

BASE EXACTA
tryon_backoffice-main - 2026-08-07T163455.185.zip

1. SIMULADOR DE GANANCIAS
NO se rediseña.
Se conserva el diseño actual y se añaden únicamente datos necesarios:
- muestra "Gastos del negocio" en cada escenario;
- aclara que el simulador es comercial y no mezcla tokens gratis;
- recomendaciones muestran Base / Gastos por token / Ganancia por token.
No se recalcula ninguna fórmula en frontend.

2. DETALLE / ADMINISTRAR USUARIO
Se conserva toda la administración existente y se revisan textos.

Resumen:
- nombres más simples: Tokens disponibles, Correo verificado, Inicio de sesión.
- roles/estados visibles en lenguaje amigable.

Movimientos de tokens:
- nueva tarjeta "Dar tokens gratis" usando la Caja Promocional EXISTENTE;
- muestra tokens gratis que conserva el usuario;
- muestra saldo promocional disponible y capacidad por proveedor;
- permite elegir proveedor y cantidad exacta;
- utiliza el endpoint existente de promotional grants;
- no crea lógica financiera nueva.
- nueva tarjeta de "Ajuste administrativo de tokens" usando el endpoint existente;
  se diferencia explícitamente de regalar tokens.
- conserva el historial existente.

Nueva pestaña: ALMACENAMIENTO
- Generaciones con miniaturas.
- Archivos subidos (inputs).
- Resultados.
- Librería.
- Otros archivos.
- búsqueda y filtros.
- muestra tamaño total.
- previews mediante signed-url del storage existente.
- respeta el provider almacenado en cada archivo aunque la configuración activa cambie.
- permite eliminar una generación terminada y sus resultados.
- NO borra inputs automáticamente.
- aclara que el historial financiero se conserva.
- si hay más de 1000 archivos avisa que muestra solo los recientes.

3. CONFIGURACIÓN / ECONOMÍA
- se elimina del formulario el manejo innecesario de moneda configurable;
  la plataforma continúa mostrando USD.
- el resto de la configuración sigue usando los mismos endpoints.

VALIDACIÓN
Los 8 archivos TS/TSX modificados pasaron TypeScript 5.8.3 transpileModule:
0 errores sintácticos.

No se ejecutó next build en este entorno porque el ZIP fuente no incluye
node_modules. Ejecutarlo localmente.

NO HAY APPWEB EN ESTE MEGAZIP.

GIT
git add .
git commit -m "feat: upgrade simulator and user administration"
git push
