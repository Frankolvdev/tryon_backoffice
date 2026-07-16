# BackOffice 09E — Configuración correcta de seguridad

Este ZIP reemplaza la pantalla de seguridad creada anteriormente.

## BackOffice

Solo presenta el control que realmente necesitas:

- Exigir MFA administrativo.
- Al activarlo, el login conserva el flujo original:
  correo + contraseña → código autenticador.
- Al desactivarlo:
  correo + contraseña → dashboard.

## Usuarios finales

Configura la verificación de cuenta que ya soporta el backend:

- OTP enviado por email.
- Enlace enviado por email.
- OTP y enlace.
- Verificación deshabilitada.

También permite configurar:

- expiración del OTP;
- intentos máximos;
- expiración del enlace.

## Importante

La verificación de cuenta de usuarios finales y el MFA TOTP del BackOffice son sistemas distintos. Esta pantalla los separa claramente.

## Requisito

Instala primero:

`backend_09c_restore_admin_mfa_policy.zip`

## Instalación

Descomprime sobre el BackOffice:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Git

```powershell
git add .
git commit -m "Security - Correct admin MFA and user verification settings"
git push
```
