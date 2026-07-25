MEGAZIP 4O BACKOFFICE

Corrige el Docker Run interactivo:
- siempre usa docker run --rm -it;
- usa GPU y puertos configurados;
- usa container_name configurado;
- usa build_name con tag 1.0.0;
- usa models_volume y workflows_volume del runtime;
- si están vacíos, reutiliza el volumen Docker del exportador;
- conserva output_volume solamente cuando se configuró;
- evita errores por propiedades undefined;
- PowerShell, CMD, Bash y una línea siguen siendo dinámicos.

Validación:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
