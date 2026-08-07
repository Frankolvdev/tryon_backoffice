# FIX BackOffice — Retirar tokens gratis

BASE
tryon_backoffice-main - 2026-08-07T170313.908.zip

CAMBIO
La tarjeta inferior que antes decía Ajuste manual de saldo ahora es exclusivamente:
RETIRAR TOKENS GRATIS

- Solo acepta cantidades positivas a retirar.
- Muestra cuántos tokens promocionales sin usar tiene el usuario.
- No permite agregar tokens.
- Para agregar tokens se usa únicamente la tarjeta superior Dar tokens gratis.
- Al retirar, explica que el respaldo vuelve a la caja promocional original.
- Las dos tarjetas se refrescan entre sí automáticamente después de agregar o retirar.

BLINDAJE
No cambia diseño general de Administración de usuario ni otras pestañas.
No toca compras, planes, cupones, tokens comerciales ni fórmulas.

VALIDACIÓN
3 archivos TS/TSX: TypeScript 5.8.3 transpileModule, 0 diagnostics.

GIT
git add .
git commit -m "fix: make user token removal promotional-only"
git push
