from pathlib import Path
import shutil

HERE=Path(__file__).resolve().parent
ROOT=Path.cwd()

def copy_new(rel):
    src=HERE/rel
    dst=ROOT/rel
    if dst.exists():
        raise RuntimeError(f"BLINDAJE: ya existe {rel}; no se sobrescribió.")
    dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,dst)
    print("CREADO",rel)

for rel in [
 "src/types/ancestry-media-assets.ts",
 "src/app/api/admin/tools-generation/ancestry-assets/[[...segments]]/route.ts",
 "src/app/api/admin/tools-generation/ancestry-assets-export/route.ts",
 "src/app/dashboard/tools-generation/ancestry-assets/page.tsx",
 "src/app/dashboard/tools-generation/ancestry-assets/page.module.css",
]:
    copy_new(rel)

p=ROOT/"src/config/backoffice-navigation.ts"
text=p.read_text(encoding="utf-8")
anchor = '      {\n        label: "Generador de proporciones",\n        href: "/dashboard/tools-generation/body-proportions",\n        icon: WandSparkles,\n      },\n'
addition = anchor + '      {\n        label: "Ancestry Media",\n        href: "/dashboard/tools-generation/ancestry-assets",\n        icon: Globe2,\n      },\n'
if addition in text:
    print("YA APLICADO navegación")
elif text.count(anchor)==1:
    p.write_text(text.replace(anchor,addition,1),encoding="utf-8")
    print("PATCH MINIMO navegación")
else:
    raise RuntimeError("BLINDAJE: no se encontró exactamente el bloque de navegación esperado.")

print("\nOK. Generador de proporciones y demás vistas no fueron modificados.")
