#!/usr/bin/env python3
"""
HF12B — Corrige referencia TypeScript a saveAllConfiguration.

Ejecutar desde la raíz de tryon_backoffice:

    python apply_hf12b_export_compile_fix.py
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path.cwd()
TARGET = ROOT / "src/components/runtime-builder/runtime-mega3-panel.tsx"

if not TARGET.exists():
    raise SystemExit(
        "No se encontró src/components/runtime-builder/runtime-mega3-panel.tsx. "
        "Ejecuta este instalador desde la raíz de tryon_backoffice."
    )

source = TARGET.read_text(encoding="utf-8")
original = source

problematic = (
    'const saveFn=typeof saveAllConfiguration==="function"?'
    'saveAllConfiguration:save;'
    'const saved=await saveFn(false as never);'
)

if problematic not in source:
    if "HF12B_EXPORT_COMPILE_FIX" in source:
        print("HF12B ya estaba aplicado.")
        raise SystemExit(0)

    raise SystemExit(
        "No se encontró la referencia problemática de HF12. "
        "No se modificó ningún archivo."
    )

# Elegir en tiempo de parcheo la función que realmente existe en este archivo.
if "const saveAllConfiguration=async" in source:
    replacement = (
        '/* HF12B_EXPORT_COMPILE_FIX */'
        'const saved=await saveAllConfiguration(false);'
    )
elif "const save=async" in source:
    replacement = (
        '/* HF12B_EXPORT_COMPILE_FIX */'
        'await save();'
        'const saved=true;'
    )
elif (
    "const saveExportConfiguration=async" in source
    and "const saveRuntimeConfiguration=async" in source
):
    replacement = (
        '/* HF12B_EXPORT_COMPILE_FIX */'
        'const [savedExport,savedRuntime]=await Promise.all(['
        'saveExportConfiguration(false),'
        'saveRuntimeConfiguration(false)'
        ']);'
        'const saved=savedExport!==false&&savedRuntime!==false;'
    )
else:
    raise SystemExit(
        "No se encontró ninguna función de guardado compatible. "
        "No se modificó ningún archivo."
    )

source = source.replace(problematic, replacement, 1)

if "saveAllConfiguration===\"function\"" in source:
    raise SystemExit(
        "Validación fallida: todavía existe la referencia TypeScript problemática."
    )

backup = TARGET.with_suffix(TARGET.suffix + ".hf12b.bak")
if not backup.exists():
    backup.write_text(original, encoding="utf-8")

TARGET.write_text(source, encoding="utf-8")

print("HF12B aplicado correctamente.")
print("Archivo modificado:", TARGET.relative_to(ROOT))
print("Respaldo:", backup.relative_to(ROOT))
