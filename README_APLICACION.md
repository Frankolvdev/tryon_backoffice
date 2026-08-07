# MegaZIP 4E — BackOffice — Caja en lenguaje simple + tooltips corregidos

BASE
tryon_backoffice-main - 2026-08-07T153153.851.zip

ALCANCE
Solo UX del BackOffice. No modifica Backend, AppWeb, API, fórmulas, movimientos,
snapshots, FIFO, descuentos, vencimientos ni base de datos.

CAMBIOS PRINCIPALES

1. TABLA PRINCIPAL DE BOLSAS SIMPLIFICADA
Se eliminan de la tabla principal dos datos técnicos que confundían:
- "Reservado para tokens"
- "Crédito libre en proveedor"

NO se elimina ningún dato del sistema.
Ambos siguen disponibles dentro de "Ver detalle".

La tabla principal queda enfocada en:
- Bolsa
- Usuario
- Origen
- Estado
- Tokens
- Pagó el cliente
- Ganancia
- Dinero extra
- Disponible para ti
- IA aún en tu caja
- IA ya enviada
- Vencimiento
- Acción

2. "CRÉDITO LIBRE EN PROVEEDOR"
Ya no se llama así.
En Ver detalle aparece como:
"Dinero que quedó dentro del proveedor"

Explicación:
Dinero que ya habías enviado a Modal/RunPod/Beam y que, al vencer tokens,
no pudo volver a tu caja. No es dinero nuevo ni retirable.

3. TOOLTIP CORREGIDO
El tooltip anterior vivía dentro del contenedor de la tabla y podía quedar
recortado o detrás de cards/scroll.

Ahora usa un portal a document.body y posición fixed con z-index 9999.
Funciona con:
- hover;
- teclado/focus;
- clic/tap.

4. SE ELIMINA LA GUÍA DE 4 CARDS DE COLORES
Se reemplaza por una única caja neutral "Cómo leer esta tabla".
Así los colores ya no compiten con las tarjetas de resumen.

5. TARJETAS SUPERIORES SIMPLIFICADAS
- "Puedes gastar o retirar" -> "Dinero libre para ti"
- "Para proveedores de IA" -> "IA aún en tu caja"
- "Dinero enviado a proveedores" -> "IA ya enviada"
- se elimina visualmente "Reservado para tokens activos"
- "Ganancia aún no disponible" -> "Ganancia todavía en espera"

El dato protegido sigue existiendo en Backend y en el detalle de bolsa.

6. PROVEEDORES EN LENGUAJE SIMPLE
Sección:
"Dinero en proveedores de IA"

Métricas:
- Dinero enviado
- Costo de generaciones
- Saldo estimado dentro
- Costo aún sin cubrir
- Quedó dentro al vencer

Cada una tiene tooltip modo kinder.
La pantalla aclara que el saldo es una estimación interna y NO consulta
automáticamente la cuenta real de Modal/RunPod/Beam.

7. MÁS TEXTOS SIMPLIFICADOS
- Pérdidas pendientes -> Generaciones que todavía deben pagarse
- Costo de IA pendiente -> IA que falta recuperar
- Ganancia potencial -> Ganancia si se cobra
- Caja operativa -> Dinero para gastos
- Registrar gasto operativo -> Registrar gasto del negocio
- Créditos promocionales -> Dinero para tokens gratis / Tokens gratis
- Reserva utilizada -> Dinero usado
- Conciliar con Stripe -> Comprobar con Stripe
- source técnicos como stripe_token_purchase se muestran como "Compra directa"

8. VENCIMIENTOS
El texto ahora dice claramente:
- el dinero de IA que todavía tienes contigo puede pasar a utilidad;
- lo que ya enviaste a un proveedor no puede volver a tu caja;
- ese importe se registra aparte como dinero que quedó dentro del proveedor.

BLINDAJE
No cambia absolutamente ninguna fórmula ni movimiento financiero.

VALIDACIÓN
page.tsx pasó transpileModule con TypeScript 5.8.3:
0 diagnostics.

No se ejecutó next build porque el ZIP fuente no incluye node_modules.

APLICACIÓN
Extraer directamente sobre:
F:\PROYECTOS PERSONALES\TRYON\backoffice

PRUEBA LOCAL
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev

GIT
git add .
git commit -m "ux: simplify cashbox and fix financial tooltips"
git push
