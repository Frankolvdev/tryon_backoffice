# Cierre del módulo Usuarios

Copia el contenido de esta carpeta sobre la raíz del proyecto `backoffice`.

Archivos incluidos:

- `src/types/admin-users.ts`
- `src/components/backoffice/user-subscription-panel.tsx`
- `src/components/backoffice/user-token-purchases-panel.tsx`
- `src/app/dashboard/users/[userId]/page.tsx`

Los paneles reutilizan el proxy dinámico ya creado en:

- `src/app/api/admin/[...segments]/route.ts`

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```
