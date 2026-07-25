Descomprime en la raíz del BackOffice y ejecuta:

python APLICAR_MEGAZIP_4K_BACKOFFICE.py
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
