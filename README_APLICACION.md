# MegaZIP 2B — BackOffice — Créditos promocionales

BASE EXACTA:
tryon_backoffice-main - 2026-08-07T123538.374.zip
(con MegaZIP 1 ya aplicado por el usuario)

INCLUYE
- Nueva sección "Créditos promocionales" en Caja.
- Saldo total promocional y saldos por proveedor.
- Alta manual de fondo promocional en USD.
- Proveedores: Modal / RunPod / Beam / General.
- Switch "Dar tokens al registrarse".
- Campo "Tokens por nuevo usuario" (usa el setting existente free_signup_tokens).
- Proveedor que respalda el bono de registro.
- Switch "Permitir promocionales para deudas anteriores".
  Está apagado por defecto.
- Modal para asignar manualmente tokens a un usuario.
- Historial de grants.
- Vencimiento promocional muestra que el crédito regresó al fondo y USD 0 pasó
  a utilidad.
- Diferencia visual entre:
  * crédito promocional temporal reservado por token;
  * capacidad IA normal que conserva la regla de generación.

NO MODIFICA
- Caja verde;
- retiros de utilidad;
- Caja IA comercial;
- fondeos comerciales;
- fórmulas;
- descuentos;
- snapshots comerciales;
- generaciones.

VALIDACIÓN
Los archivos TypeScript modificados pasaron parser sintáctico con TypeScript.
El build completo debe ejecutarse localmente con las dependencias del proyecto.
