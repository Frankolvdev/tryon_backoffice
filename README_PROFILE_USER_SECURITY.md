# BackOffice — Perfiles, usuarios y MFA separado

## Requiere primero

Instalar el ZIP del backend:

`backend_09a_profile_mfa_foundation.zip`

y ejecutar:

```powershell
alembic upgrade head
```

## Incluye

### Administrar usuarios

Nuevo componente:

`src/components/backoffice/user-account-management-panel.tsx`

Permite:

- cambiar correo;
- cambiar nombre;
- restablecer contraseña.

La pantalla existente de detalle de usuario queda actualizada automáticamente con la nueva pestaña **Cuenta y contraseña**. No requiere modificaciones manuales.

### Mi perfil

Nueva ruta:

`/dashboard/profile`

Permite al administrador o trabajador:

- cambiar nombre;
- cambiar correo;
- cambiar contraseña;
- revocar todas sus sesiones.

El menú superior ahora contiene:

- Mi perfil;
- Seguridad y MFA;
- Cerrar sesión.

### Configuración MFA

Nueva ruta:

`/dashboard/settings/security`

Permite configurar por separado:

- MFA obligatorio para BackOffice;
- TOTP para BackOffice;
- códigos de recuperación para BackOffice;
- MFA disponible para usuarios finales;
- MFA obligatorio para usuarios finales;
- TOTP para usuarios finales;
- códigos de recuperación para usuarios finales.

## Nota

El ZIP no inventa SMS, correo como segundo factor, WhatsApp ni biometría. El backend implementa TOTP y códigos de recuperación.

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
git commit -m "Profiles - User management and separate MFA settings"
git push
```
