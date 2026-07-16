# 09C — Corrección de Administración de Usuario

Este ZIP corrige los errores introducidos por el ZIP anterior.

## Causa exacta

Los componentes existentes esperan:

```tsx
<UserRbacPanel userId={number} />
<UserSubscriptionPanel userId={number} />
<UserTokenPurchasesPanel userId={number} />
```

El ZIP anterior les enviaba el objeto completo `user`.

Eso producía rutas incorrectas como:

```text
/api/admin/rbac/users/[object Object]
/api/admin/subscriptions?user_id=[object Object]
/api/admin/token-purchases?user_id=[object Object]
```

Por eso aparecían errores como:

- `No fue posible conectar con el backend local`
- `Input should be a valid integer`
- errores similares en varias pestañas

## Correcciones

- Roles y permisos recibe `user.id`.
- Sesiones recibe `user.id`.
- Suscripción recibe `user.id`.
- Compras de tokens recibe `user.id`.
- Se conserva la pantalla original completa.
- Se agrega una pestaña visible `Editar usuario`.
- Se agrega un botón superior `Editar usuario`.
- El administrador puede cambiar correo y nombre.
- El administrador puede restablecer la contraseña.
- No requiere cambios manuales.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Git

```powershell
git add .
git commit -m "Fix user administration panels and editing"
git push
```
