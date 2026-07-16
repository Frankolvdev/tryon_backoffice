# 09D — Fix Profile and MFA Navigation

## Problema corregido

La página MFA ya existía en:

`/dashboard/settings/security`

pero el menú lateral seguía mostrando:

- `MFA` deshabilitado;
- `Seguridad` deshabilitado;
- sin ningún `href`.

El menú superior tampoco enlazaba a:

- Mi perfil;
- Seguridad y MFA.

## Cambios

### Navegación lateral

Se habilitan:

- Administración → Seguridad
- Sistema → MFA

Ambos enlazan a:

`/dashboard/settings/security`

### Menú superior

Se agregan:

- Mi perfil → `/dashboard/profile`
- Seguridad y MFA → `/dashboard/settings/security`
- Cerrar sesión

## Archivos reemplazados

- `src/config/backoffice-navigation.ts`
- `src/components/backoffice/admin-profile-menu.tsx`

## Archivos que ya deben existir

- `src/app/dashboard/profile/page.tsx`
- `src/app/dashboard/settings/security/page.tsx`
- `src/types/profile-security.ts`

Esos archivos fueron incluidos en el ZIP anterior.

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

Luego abre:

```text
http://127.0.0.1:3000/dashboard/settings/security
```

## Git

```powershell
git add .
git commit -m "Navigation - Enable profile and MFA settings"
git push
```
