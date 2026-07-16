# 09F — Fix Account Security PUT Route

## Error corregido

El navegador enviaba:

```text
PUT /api/admin/account-security/settings
```

pero el BackOffice no tenía un Route Handler que exportara `PUT`, por lo que Next.js respondía:

```text
405 Method Not Allowed
```

El backend sí expone:

```text
PUT /api/v1/admin/account-security/settings
```

## Solución

Se agrega el proxy interno:

```text
src/app/api/admin/account-security/settings/route.ts
```

con soporte para:

- `GET`
- `PUT`

Ambos usan el helper existente:

```text
forwardAdminRequest
```

y reenvían la autenticación administrativa al backend real.

## Instalación

Descomprime directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Luego ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Verificación

Abre:

```text
http://127.0.0.1:3000/dashboard/settings/security
```

Cambia una opción y presiona:

```text
Guardar configuración
```

La terminal de Next.js debe mostrar:

```text
PUT /api/admin/account-security/settings 200
```

Y el backend:

```text
PUT /api/v1/admin/account-security/settings 200
```

## Git

```powershell
git add .
git commit -m "Security - Add account settings PUT proxy"
git push
```
