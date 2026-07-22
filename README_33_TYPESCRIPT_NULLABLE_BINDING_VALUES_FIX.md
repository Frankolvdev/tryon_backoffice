# Hotfix 33 — Nullable workflow binding values

Normaliza a cadena vacía los valores opcionales de los controles React del editor de bindings (`module_input_key`, `module_output_key`, `node_id` e `input_field`). Evita que `null` llegue a las propiedades `value` de `<select>` e `<input>` durante el type-check de Next.js.
