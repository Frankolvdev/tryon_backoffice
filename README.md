# MegaZIP 2 — BackOffice Profit per Token UI

- Pricing rules now edit **Ganancia deseada por token consumido (USD)**.
- Pricing diagnostics show the limiting profit per token.
- Applied pricing rules show profit/token and keep infrastructure diagnostics intact.
- Plan/package discount simulators use the exact profit contained in their token quantity.

Run:
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```
