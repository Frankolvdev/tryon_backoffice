#!/usr/bin/env python3
"""
HF12C — Corrige comparación imposible true === false.

Ejecutar desde la raíz de tryon_backoffice:

    python apply_hf12c_export_type_fix.py
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
    '/* HF12B_EXPORT_COMPILE_FIX */'
    'await save();'
    'const saved=true;'
    'if(saved===false)'
    'throw new Error("No se pudo guardar la configuración antes de exportar.");'
)

replacement = (
    '/* HF12C_EXPORT_TYPE_FIX */'
    'await save();'
)

if problematic in source:
    source = source.replace(problematic, replacement, 1)
else:
    # Variante por si el archivo tiene espacios o saltos mínimos distintos.
    source = source.replace(
        'await save();const saved=true;if(saved===false)throw new Error("No se pudo guardar la configuración antes de exportar.");',
        '/* HF12C_EXPORT_TYPE_FIX */await save();',
        1,
    )

if source == original:
    if "HF12C_EXPORT_TYPE_FIX" in source:
        print("HF12C ya estaba aplicado.")
        raise SystemExit(0)
    raise SystemExit(
        "No se encontró la comparación problemática de HF12B. "
        "No se modificó ningún archivo."
    )

if "const saved=true;if(saved===false)" in source:
    raise SystemExit("Validación fallida: todavía existe la comparación imposible.")

backup = TARGET.with_suffix(TARGET.suffix + ".hf12c.bak")
if not backup.exists():
    backup.write_text(original, encoding="utf-8")

TARGET.write_text(source, encoding="utf-8")

print("HF12C aplicado correctamente.")
print("Archivo modificado:", TARGET.relative_to(ROOT))
print("Respaldo:", backup.relative_to(ROOT))
