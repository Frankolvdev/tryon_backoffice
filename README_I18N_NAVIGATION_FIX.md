# 15C — Fix de navegación de Internacionalización

El repositorio actual todavía tenía esta entrada:

```ts
{
  label: "Internacionalización",
  icon: Languages,
  disabled: true,
}
```

Este fix la reemplaza por:

```ts
{
  label: "Internacionalización",
  href: "/dashboard/internationalization",
  icon: Languages,
}
```

## Instalación

Extrae directamente sobre:

`F:\PROYECTOS PERSONALES\TRYON\backoffice`

Después ejecuta:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

## Git

```powershell
git add .
git commit -m "I18n - Enable navigation entry"
git push
```
